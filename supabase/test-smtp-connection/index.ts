import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("=== SMTP CONNECTION TEST STARTED ===");
  
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [] as any[],
    success: false,
    error: null as string | null
  };

  try {
    // Test 1: Check environment variables
    console.log("Test 1: Checking environment variables...");
    const gmailEmail = Deno.env.get("GMAIL_EMAIL");
    const gmailPassword = Deno.env.get("GMAIL_APP_PASSWORD");
    
    testResults.tests.push({
      name: "Environment Variables",
      success: !!(gmailEmail && gmailPassword),
      details: {
        hasEmail: !!gmailEmail,
        hasPassword: !!gmailPassword,
        emailLength: gmailEmail?.length || 0,
        passwordLength: gmailPassword?.length || 0
      }
    });

    if (!gmailEmail || !gmailPassword) {
      throw new Error("Gmail credentials not found in environment variables");
    }

    console.log(`Gmail email: ${gmailEmail}`);
    console.log(`Password length: ${gmailPassword.length}`);

    // Test 2: Basic TCP connection to Gmail SMTP
    console.log("Test 2: Testing basic TCP connection to Gmail SMTP...");
    let tcpConnection: Deno.TcpConn | null = null;
    
    try {
      tcpConnection = await Deno.connect({
        hostname: "smtp.gmail.com",
        port: 587,
      });
      
      console.log("TCP connection successful");
      testResults.tests.push({
        name: "TCP Connection",
        success: true,
        details: "Successfully connected to smtp.gmail.com:587"
      });

      // Test 3: Read Gmail greeting
      console.log("Test 3: Reading Gmail server greeting...");
      const decoder = new TextDecoder();
      const buffer = new Uint8Array(1024);
      const bytesRead = await tcpConnection.read(buffer);
      const greeting = decoder.decode(buffer.slice(0, bytesRead || 0));
      console.log("Server greeting:", greeting);
      
      testResults.tests.push({
        name: "Server Greeting",
        success: greeting.includes("220"),
        details: greeting.trim()
      });

      if (!greeting.includes("220")) {
        throw new Error("Did not receive expected 220 greeting from Gmail");
      }

      // Test 4: Send EHLO command
      console.log("Test 4: Sending EHLO command...");
      const encoder = new TextEncoder();
      await tcpConnection.write(encoder.encode("EHLO localhost\r\n"));
      
      const ehloBuffer = new Uint8Array(1024);
      const ehloBytesRead = await tcpConnection.read(ehloBuffer);
      const ehloResponse = decoder.decode(ehloBuffer.slice(0, ehloBytesRead || 0));
      console.log("EHLO response:", ehloResponse);
      
      testResults.tests.push({
        name: "EHLO Command",
        success: ehloResponse.includes("250"),
        details: ehloResponse.trim()
      });

      // Test 5: STARTTLS command
      console.log("Test 5: Testing STARTTLS...");
      await tcpConnection.write(encoder.encode("STARTTLS\r\n"));
      
      const tlsBuffer = new Uint8Array(1024);
      const tlsBytesRead = await tcpConnection.read(tlsBuffer);
      const tlsResponse = decoder.decode(tlsBuffer.slice(0, tlsBytesRead || 0));
      console.log("STARTTLS response:", tlsResponse);
      
      testResults.tests.push({
        name: "STARTTLS Command",
        success: tlsResponse.includes("220"),
        details: tlsResponse.trim()
      });

      if (tlsResponse.includes("220")) {
        // Test 6: TLS Upgrade
        console.log("Test 6: Upgrading to TLS...");
        try {
          const tlsConnection = await Deno.startTls(tcpConnection, {
            hostname: "smtp.gmail.com",
          });
          
          console.log("TLS upgrade successful");
          testResults.tests.push({
            name: "TLS Upgrade",
            success: true,
            details: "Successfully upgraded to TLS connection"
          });

          // Test 7: EHLO after TLS
          console.log("Test 7: EHLO after TLS...");
          await tlsConnection.write(encoder.encode("EHLO localhost\r\n"));
          
          const ehloTlsBuffer = new Uint8Array(1024);
          const ehloTlsBytesRead = await tlsConnection.read(ehloTlsBuffer);
          const ehloTlsResponse = decoder.decode(ehloTlsBuffer.slice(0, ehloTlsBytesRead || 0));
          console.log("EHLO after TLS response:", ehloTlsResponse);
          
          testResults.tests.push({
            name: "EHLO after TLS",
            success: ehloTlsResponse.includes("250"),
            details: ehloTlsResponse.trim()
          });

          // Test 8: Authentication
          console.log("Test 8: Testing authentication...");
          await tlsConnection.write(encoder.encode("AUTH LOGIN\r\n"));
          
          const authBuffer = new Uint8Array(1024);
          const authBytesRead = await tlsConnection.read(authBuffer);
          const authResponse = decoder.decode(authBuffer.slice(0, authBytesRead || 0));
          console.log("AUTH LOGIN response:", authResponse);
          
          if (authResponse.includes("334")) {
            // Send username
            const usernameB64 = btoa(gmailEmail);
            await tlsConnection.write(encoder.encode(`${usernameB64}\r\n`));
            
            const userBuffer = new Uint8Array(1024);
            const userBytesRead = await tlsConnection.read(userBuffer);
            const userResponse = decoder.decode(userBuffer.slice(0, userBytesRead || 0));
            console.log("Username response:", userResponse);
            
            if (userResponse.includes("334")) {
              // Send password
              const passwordB64 = btoa(gmailPassword);
              await tlsConnection.write(encoder.encode(`${passwordB64}\r\n`));
              
              const passBuffer = new Uint8Array(1024);
              const passBytesRead = await tlsConnection.read(passBuffer);
              const passResponse = decoder.decode(passBuffer.slice(0, passBytesRead || 0));
              console.log("Password response:", passResponse);
              
              testResults.tests.push({
                name: "Authentication",
                success: passResponse.includes("235"),
                details: passResponse.trim()
              });

              if (passResponse.includes("235")) {
                testResults.success = true;
                console.log("All SMTP tests passed!");
              } else {
                testResults.error = "Authentication failed - check Gmail App Password";
              }
            } else {
              testResults.error = "Username not accepted";
            }
          } else {
            testResults.error = "AUTH LOGIN not supported or failed";
          }
          
          // Clean up TLS connection
          tlsConnection.close();
        } catch (tlsError) {
          console.error("TLS upgrade failed:", tlsError);
          testResults.tests.push({
            name: "TLS Upgrade",
            success: false,
            details: tlsError.message
          });
          testResults.error = `TLS upgrade failed: ${tlsError.message}`;
        }
      } else {
        testResults.error = "STARTTLS command failed";
      }

      // Clean up TCP connection
      tcpConnection.close();
      
    } catch (connectionError) {
      console.error("Connection error:", connectionError);
      testResults.tests.push({
        name: "TCP Connection",
        success: false,
        details: connectionError.message
      });
      testResults.error = `Connection failed: ${connectionError.message}`;
      
      if (tcpConnection) {
        tcpConnection.close();
      }
    }

  } catch (error) {
    console.error("Test error:", error);
    testResults.error = error.message;
  }

  console.log("=== TEST RESULTS ===");
  console.log(JSON.stringify(testResults, null, 2));

  return new Response(
    JSON.stringify(testResults, null, 2),
    {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    }
  );
};

serve(handler);