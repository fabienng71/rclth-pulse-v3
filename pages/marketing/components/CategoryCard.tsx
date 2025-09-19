import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VendorSeparator } from './VendorSeparator';
import { ItemsTable } from './ItemsTable';
import { PriceListItem } from '@/hooks/usePriceListData';

interface CategoryCardProps {
  categoryCode: string;
  categoryName: string;
  organizedItems: {
    main: PriceListItem[];
    roamBrand: PriceListItem[];
    iconBrand: PriceListItem[];
    sicolyBrand: PriceListItem[];
    moulinVironBrand: PriceListItem[];
    margraBrand: PriceListItem[];
    laMarcaBrand: PriceListItem[];
    moulinDuCalanquetBrand: PriceListItem[];
    huilerieBeaujolaiseBrand: PriceListItem[];
    isignyStemereBrand: PriceListItem[];
    truffleBrand: PriceListItem[];
    mushroomsBrand: PriceListItem[];
    lesFreresMarchand: PriceListItem[];
    caviarPerseus: PriceListItem[];
    huitresDavidHerve: PriceListItem[];
    qwehli: PriceListItem[];
    snacking: PriceListItem[];
  };
  formatPrice: (price: number | null) => string;
}

export const CategoryCard = ({ 
  categoryCode, 
  categoryName, 
  organizedItems, 
  formatPrice 
}: CategoryCardProps) => {
  return (
    <Card key={categoryCode} className="mb-6">
      <CardHeader>
        <CardTitle>{categoryName}</CardTitle>
      </CardHeader>
      <CardContent>
        {organizedItems.main.length > 0 && (
          <ItemsTable items={organizedItems.main} formatPrice={formatPrice} />
        )}

        {organizedItems.snacking.length > 0 && (
          <>
            <VendorSeparator title="SNACKING" />
            <ItemsTable items={organizedItems.snacking} formatPrice={formatPrice} />
          </>
        )}

        {organizedItems.roamBrand.length > 0 && (
          <>
            <VendorSeparator title="ROAM" />
            <ItemsTable items={organizedItems.roamBrand} formatPrice={formatPrice} />
          </>
        )}

        {organizedItems.iconBrand.length > 0 && (
          <>
            <VendorSeparator title="ICON" />
            <ItemsTable items={organizedItems.iconBrand} formatPrice={formatPrice} />
          </>
        )}
        
        {organizedItems.sicolyBrand.length > 0 && (
          <>
            <VendorSeparator title="SICOLY" />
            <ItemsTable items={organizedItems.sicolyBrand} formatPrice={formatPrice} />
          </>
        )}
        
        {organizedItems.moulinVironBrand.length > 0 && (
          <>
            <VendorSeparator title="MOULIN VIRON" />
            <ItemsTable items={organizedItems.moulinVironBrand} formatPrice={formatPrice} />
          </>
        )}
        
        {organizedItems.margraBrand.length > 0 && (
          <>
            <VendorSeparator title="MARGRA" />
            <ItemsTable items={organizedItems.margraBrand} formatPrice={formatPrice} />
          </>
        )}
        
        {organizedItems.laMarcaBrand.length > 0 && (
          <>
            <VendorSeparator title="LA MARCA" />
            <ItemsTable items={organizedItems.laMarcaBrand} formatPrice={formatPrice} />
          </>
        )}

        {organizedItems.moulinDuCalanquetBrand.length > 0 && (
          <>
            <VendorSeparator title="MOULIN DU CALANQUET" />
            <ItemsTable items={organizedItems.moulinDuCalanquetBrand} formatPrice={formatPrice} />
          </>
        )}

        {organizedItems.huilerieBeaujolaiseBrand.length > 0 && (
          <>
            <VendorSeparator title="HUILERIE BEAUJOLAISE" />
            <ItemsTable items={organizedItems.huilerieBeaujolaiseBrand} formatPrice={formatPrice} />
          </>
        )}
        
        {organizedItems.isignyStemereBrand.length > 0 && (
          <>
            <VendorSeparator title="ISIGNY STE MERE" />
            <ItemsTable items={organizedItems.isignyStemereBrand} formatPrice={formatPrice} />
          </>
        )}
        
        {organizedItems.truffleBrand.length > 0 && (
          <>
            <VendorSeparator title="TRUFFLE" />
            <ItemsTable items={organizedItems.truffleBrand} formatPrice={formatPrice} />
          </>
        )}
        
        {organizedItems.mushroomsBrand.length > 0 && (
          <>
            <VendorSeparator title="MUSHROOMS" />
            <ItemsTable items={organizedItems.mushroomsBrand} formatPrice={formatPrice} />
          </>
        )}

        {organizedItems.lesFreresMarchand.length > 0 && (
          <>
            <VendorSeparator title="Les Freres Marchand" />
            <ItemsTable items={organizedItems.lesFreresMarchand} formatPrice={formatPrice} />
          </>
        )}

        {organizedItems.caviarPerseus.length > 0 && (
          <>
            <VendorSeparator title="Caviar Perseus" />
            <ItemsTable items={organizedItems.caviarPerseus} formatPrice={formatPrice} />
          </>
        )}

        {organizedItems.huitresDavidHerve.length > 0 && (
          <>
            <VendorSeparator title="Huitres David Herve" />
            <ItemsTable items={organizedItems.huitresDavidHerve} formatPrice={formatPrice} />
          </>
        )}
        
        {organizedItems.qwehli.length > 0 && (
          <>
            <VendorSeparator title="Qwehli" />
            <ItemsTable items={organizedItems.qwehli} formatPrice={formatPrice} />
          </>
        )}
      </CardContent>
    </Card>
  );
};
