## Use Cases for Iteration 1

### 1. Seller - Create Account
- **Description**: Allows sellers to create a new account.
- **To Test**:
  1. When you load the website, select "Sign Up" and choose "Seller".
  2. Enter a valid username and password (ensure the username does not already exist) Enter an email, not used other than in cognito (required field in cognito).
  3. Wait for a successful page response indicating the account has been created.

### 2. Seller - Login Account
- **Description**: Allows sellers to log in to their account.
- **To Test**:
  1. When you load the website, select "Log In" and choose "Seller".
  2. Enter a valid username and password (Use amanda1 and amanda1 for username and password).
  3. Wait for a successful page response indicating a valid log in
  4. Ensure successful login and redirection to the seller view items.

### 3. Buyer - Create Account
- **Description**: Allows buyers to create a new account.
- **To Test**:
  1. When you load the website, select "Sign Up" and choose "Buyer".
  2. Enter a valid username and password (ensure the username does not already exist). Enter an email, not used other than in cognito (required field in cognito).
  3. Wait for a successful page response indicating the account has been created.

### 4. Buyer - Login Account
- **Description**: Allows buyers to log in to their account.
- **To Test**:
  1. When you load the website, select "Log In" and choose "Buyer".
  2. Enter a valid username and password (Use testBuyer and testBuyer for username and password). 
  3. Wait for a successful page response indicating a valid log in

### 5. Seller - Review Items
- **Description**: Sellers can review the items they have
- **To Test**:
  1. Log in as a seller (Use amanda1 and amanda1 for username and password).
  2. You will be directed to the seller review items page on login
  3. There will be some test items available to see

### 6. Seller - Publish Items
- **Description**: Sellers can publish items for sale.
- **To Test**:
  1. Log in as a seller (Use amanda1 and amanda1 for username and password).
  2. You will be directed to the seller review items page and will see some test items
  3. From the "seller action" dropdown select "publish item" and then click "Perform Action"
  4. If the item was inactive its status should change to active

### 7. Seller - Unpublish Item
- **Description**: Sellers can unpublish items they have listed.
- **To Test**:
  1. Log in as a seller (Use amanda1 and amanda1 for username and password).
  2. You will be directed to the seller review items page and will see some test items
  3. From the "seller action" dropdown select "unpublish item" and then click "Perform Action"
  4. If the item was active its status should change to inactive

### 8. Customer - View Item
- **Description**: Customers can view active items
- **To Test**:
  1. When you load the website, select "Continue as a Customer"
  2. You will be directed to the customer view items page and will see the active test items

### 9. Customer - Search Item
- **Description**: Customers can search for items.
- **To Test**:
  1. When you load the website, select "Continue as a Customer"
  2. On the view items screen you can search any of the test items by name and the others will be filtered out
  3. Verify that the correct items are returned based on the search query.

### 10. Customer - Sort Item
- **Description**: Customers can sort items based on different criteria.
- **To Test**:
  1. When you load the website, select "Continue as a Customer"
  2. On the view items screen you can sort any of the test items by price, start date, or end date
  by selecting the up and down arrows next to the catagory and it switch from low to high and high
  to low


