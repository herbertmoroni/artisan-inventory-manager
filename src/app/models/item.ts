export interface Item {
    _id?: string;
    userId?: string;
    name: string;
    category: ItemCategory;
    description: string;
    color: string;
    price: number;
    quantity: number;
    image?: string;
    nextImport: boolean;
    dateAdded: Date;
    soldAt?: {
      date: Date;
      fairId: string;
    };
  }
  
  export enum ItemCategory {
    EARRINGS = 'earrings',
    BRACELETS = 'bracelets',
    NECKLACES = 'necklaces'
  }

  
 