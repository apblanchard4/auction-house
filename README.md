## Use Cases for Final Iteration

### 1. Admin - Freeze Item
- **Description**: Freeze an active item

- **To Test**:
  1. Login as admin with username and password admin
  2. Navigate to item list
  3. Find an Item with the name "Freeze Me"
  4. Select Toggle Item Frozen in Admin Actions and then click Perform Action to toggle Freeze

### 2. Admin - Forensics Report
- **Description**: Displays forensics information about the auction house
- **To Test**:
  1. Login as admin with username and password admin
  2. Navigate to Forensics Report
  3. Select a date range to filter (Test items can be seen from the last month 11/14 - 12/16)
  4. Click Generate Report

### 3. Admin - Auction Report
- **Description**: Generate a Report that gives information about auctions
- **To Test**:
  1. Login as admin with username and password admin
  2. Navigate to Auction Report
  3. Information will display on loading of the page (Total Auction house earnings at bottom of page)

### 4. Seller - Request Unfreeze
- **Description**: Seller Request admin to unfreeze frozen item
- **To Test**:
  1. Login as seller with username and password amanda1
  2. Navigate to My Items and find the item "Freeze Me" that was previously frozen
  3. Select Request Unfreeze in seller actions and then select Perform action
  4. Status will update and can be further verified back on admin page

### 5. Seller - Archive Item
- **Description**: Seller can archive an inactive item
- **To Test**:
  1. Login as seller with username and password amanda1
  2. Navigate to Item List and find Item named "Archive Me" 
  3. Select Archive in Seller actions and press Perform action

### 6. Seller - Fulfill Item
- **Description**: Seller can Fulfill a completed Item
- **To Test**: 
  1. Login as a seller (username: amanda1, password: amanda1)
  2. Navigate to Item List and find Item named "Fulfill Me" 
  3. Use the perform action button to Fulfill the Item

### 7. Seller - Buy Now
- **Description**: Seller can set an item to be buy now
- **To Test**:
  1. Login as a seller (username: amanda1, password: amanda1)
  2. Either select Add item, enter necessary details, and press Enable Buy Now or edit an inactive item and select Enable Buy now
  3. Select the item and "Item is set for By Now" is displayed
  4. Select Publish so that buyer can see the item
  5. See Buyer Buy Now to verify further

### 8. Buyer - Buy Now
- **Description**: Buyer can immediately buy an item now for its list price
- **To Test**:
  1. Login as a buyer (username: testBuyer1 password: testBuyer1)
  2. Select the item that was just created or set to buy now
  3. Click on the buy now button
  4. The item has now been purchased

### 9. Buyer - Search Recently Sold
- **Description**: Buyer can search Recently Sold Items
- **To Test**: 
  1. Login as a buyer (username: testBuyer1 password: testBuyer1)
  2. Select the Recently Sold Tab
  3. In the "Search by Name/Description" field input any desired search

### 10. Buyer - Sorth Recently Sold
- **Description**: Buyer can sort Recently Sold Items
- **To Test**: 
  1. Login as a buyer (username: testBuyer1 password: testBuyer1)
  2. Select the Recently Sold Tab
  3. Use the up and down arrows to sort fields from top to bottom in the table
  4. Sort items by setting a min and/or max price


