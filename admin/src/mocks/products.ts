
export const mockCategories = [
  { id: '1', name: 'Air Conditioner', status: 'active', description: 'Cooling and heating systems' },
  { id: '2', name: 'Refrigerator', status: 'active', description: 'Food storage and preservation' },
  { id: '3', name: 'Mobile Phone', status: 'active', description: 'Smartphones and feature phones' },
  { id: '4', name: 'Laptop', status: 'active', description: 'Portable computers' },
  { id: '5', name: 'Washing Machine', status: 'active', description: 'Laundry appliances' },
  { id: '6', name: 'Television', status: 'active', description: 'Entertainment displays' }
];

export const mockBrands = [
  // AC Brands
  { id: '1', name: 'Samsung', categoryId: '1', status: 'active' },
  { id: '2', name: 'LG', categoryId: '1', status: 'active' },
  { id: '3', name: 'Daikin', categoryId: '1', status: 'active' },
  { id: '4', name: 'Voltas', categoryId: '1', status: 'active' },
  
  // Refrigerator Brands
  { id: '5', name: 'Samsung', categoryId: '2', status: 'active' },
  { id: '6', name: 'LG', categoryId: '2', status: 'active' },
  { id: '7', name: 'Whirlpool', categoryId: '2', status: 'active' },
  { id: '8', name: 'Godrej', categoryId: '2', status: 'active' },
  
  // Mobile Brands
  { id: '9', name: 'Samsung', categoryId: '3', status: 'active' },
  { id: '10', name: 'Apple', categoryId: '3', status: 'active' },
  { id: '11', name: 'OnePlus', categoryId: '3', status: 'active' },
  { id: '12', name: 'Xiaomi', categoryId: '3', status: 'active' },
  
  // Laptop Brands
  { id: '13', name: 'Dell', categoryId: '4', status: 'active' },
  { id: '14', name: 'HP', categoryId: '4', status: 'active' },
  { id: '15', name: 'Lenovo', categoryId: '4', status: 'active' },
  { id: '16', name: 'Apple', categoryId: '4', status: 'active' },
  
  // Washing Machine Brands
  { id: '17', name: 'Samsung', categoryId: '5', status: 'active' },
  { id: '18', name: 'LG', categoryId: '5', status: 'active' },
  { id: '19', name: 'Whirlpool', categoryId: '5', status: 'active' },
  { id: '20', name: 'IFB', categoryId: '5', status: 'active' },
  
  // TV Brands
  { id: '21', name: 'Samsung', categoryId: '6', status: 'active' },
  { id: '22', name: 'LG', categoryId: '6', status: 'active' },
  { id: '23', name: 'Sony', categoryId: '6', status: 'active' },
  { id: '24', name: 'TCL', categoryId: '6', status: 'active' }
];

export const mockTypes = [
  // AC Types
  { id: '1', name: 'Split AC', brandId: '1', status: 'active' },
  { id: '2', name: 'Window AC', brandId: '1', status: 'active' },
  { id: '3', name: 'Split AC', brandId: '2', status: 'active' },
  { id: '4', name: 'Cassette AC', brandId: '3', status: 'active' },
  
  // Refrigerator Types
  { id: '5', name: 'Single Door', brandId: '5', status: 'active' },
  { id: '6', name: 'Double Door', brandId: '5', status: 'active' },
  { id: '7', name: 'Side by Side', brandId: '6', status: 'active' },
  { id: '8', name: 'French Door', brandId: '7', status: 'active' },
  
  // Mobile Types
  { id: '9', name: 'Smartphone', brandId: '9', status: 'active' },
  { id: '10', name: 'iPhone', brandId: '10', status: 'active' },
  { id: '11', name: 'Flagship', brandId: '11', status: 'active' },
  { id: '12', name: 'Redmi', brandId: '12', status: 'active' },
  
  // Laptop Types
  { id: '13', name: 'Gaming', brandId: '13', status: 'active' },
  { id: '14', name: 'Business', brandId: '14', status: 'active' },
  { id: '15', name: 'ThinkPad', brandId: '15', status: 'active' },
  { id: '16', name: 'MacBook', brandId: '16', status: 'active' },
  
  // Washing Machine Types
  { id: '17', name: 'Top Load', brandId: '17', status: 'active' },
  { id: '18', name: 'Front Load', brandId: '18', status: 'active' },
  { id: '19', name: 'Semi Automatic', brandId: '19', status: 'active' },
  { id: '20', name: 'Fully Automatic', brandId: '20', status: 'active' },
  
  // TV Types
  { id: '21', name: 'LED', brandId: '21', status: 'active' },
  { id: '22', name: 'OLED', brandId: '22', status: 'active' },
  { id: '23', name: 'QLED', brandId: '23', status: 'active' },
  { id: '24', name: 'Smart TV', brandId: '24', status: 'active' }
];

export const mockModels = [
  // Samsung AC Models
  { id: '1', name: 'AR18TY5QAWK', typeId: '1', status: 'active', description: '1.5 Ton 5 Star Split AC' },
  { id: '2', name: 'AR12TY3QAWK', typeId: '1', status: 'active', description: '1 Ton 3 Star Split AC' },
  { id: '3', name: 'AW18TYDE2', typeId: '2', status: 'active', description: '1.5 Ton Window AC' },
  
  // Samsung Refrigerator Models
  { id: '4', name: 'RR20T272YS8', typeId: '5', status: 'active', description: '192L Single Door' },
  { id: '5', name: 'RT28T3522S8', typeId: '6', status: 'active', description: '253L Double Door' },
  
  // Samsung Mobile Models
  { id: '6', name: 'Galaxy S23 Ultra', typeId: '9', status: 'active', description: 'Flagship smartphone' },
  { id: '7', name: 'Galaxy A54', typeId: '9', status: 'active', description: 'Mid-range smartphone' },
  
  // iPhone Models
  { id: '8', name: 'iPhone 15 Pro', typeId: '10', status: 'active', description: 'Latest Pro model' },
  { id: '9', name: 'iPhone 15', typeId: '10', status: 'active', description: 'Standard model' },
  
  // Dell Laptop Models
  { id: '10', name: 'Alienware m15 R7', typeId: '13', status: 'active', description: 'Gaming laptop' },
  { id: '11', name: 'XPS 13', typeId: '13', status: 'active', description: 'Ultrabook' },
  
  // MacBook Models
  { id: '12', name: 'MacBook Pro 14"', typeId: '16', status: 'active', description: 'M3 Pro chip' },
  { id: '13', name: 'MacBook Air 13"', typeId: '16', status: 'active', description: 'M2 chip' },
  
  // Samsung Washing Machine Models
  { id: '14', name: 'WA70BG4441BY', typeId: '17', status: 'active', description: '7kg Top Load' },
  { id: '15', name: 'WW80T504DAN', typeId: '18', status: 'active', description: '8kg Front Load' },
  
  // Samsung TV Models
  { id: '16', name: 'UA55AU7700K', typeId: '21', status: 'active', description: '55" 4K Smart LED TV' },
  { id: '17', name: 'QA65Q80BAK', typeId: '23', status: 'active', description: '65" QLED 4K TV' }
];
