## Use Cases for Iteration 2

### 1. Seller - Close Account
- **Description**: Close a seller account upon password input

- **To Test**:
  1. Login as seller with username and password sellerClosingTest
  2. Navigate to account page
  3. Select close account
  4. To test seller being unable to close with active items, repeat above with username and login amanda1

### 2. Buyer - Add Funds
- **Description**: Adds set amount of funds to a buyers account
- **To Test**:
  1. Login as buyer with username and password buyerClosingTest
  2. Navigate to account page
  3. Enter funds in text box 
  4. Click submit

### 3. Buyer - Close Account
- **Description**: Close a buyer account upon buyer input 
- **To Test**:
  1. Login as buyer with username and password buyerClosingTest
  2. Navigate to account page
  3. Select close account
  4. To test buy being unable to close with active bids, repeat above with username and login testBuyer1

### 4. Seller - Add Item
- **Description**: Adding seller item based on user input
- **To Test**:
  1. Login as seller with username and password amanda1
  2. Navigate to Add Item
  3. Input all fields (Image can be as a jpg or png)
  4. Select add item

### 5. Seller - Edit Item
- **Description**: Editing a seller item based on user input
- **To Test**:
  1. Login as seller with username and password amanda1
  2. Select edit item next to an inactive item (if no inactive items, set to inactive by unpublishing)
  3. Input any changes you would like
  4. Save changes

### 6. Seller - Remove Inactive Item
- **Description**: Removes an inactive item (deletes)
- **To Test**: 
  1. Log in as a seller (username: amanda1, password: amanda1)
  2. On the review items page, use the drop down to select remove.
  3. Use the perform action button to remove the item. 

### 7. Buyer - View Item
- **Description**: Shows details on active items
- **To Test**:
  1. Login as a buyer (username: testBuyer1 password: testBuyer1)
  2. View general details after all active items after log in.
  3. Select any item (the underlined blue item name)
  4. View all details about the item.

### 8. Buyer - Place Bid
- **Description**: Places a new bid on the currently selected item.
- **To Test**:
  1. Login as a buyer (username: testBuyer1 password: testBuyer1)
  2. Select any item (the underlined blue item name)
  3. Use the place bid button and enter in the bid amount. 

### 9. Buyer - Review Active Bids
- **Description**: Shows buyer's active, winning bids with amount and item name.
- **To Test**: 
  1. Login as a buyer (username: testBuyer1 password: testBuyer1)
  2. Select the Account tab
  3. See active bids (item name and amount) under Active Bid heading

### 10. Buyer - Review Purchases
- **Description**: Shows buyer's purchases (item name and amount) for completed bids (after the end date) 
- **To Test**: 
  1. Login as a buyer (username: testBuyer1 password: testBuyer1)
  2. Select the Account tab
  3. See purchases (item name and amount) under Review Purchases heading


