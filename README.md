This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# auction-house

## Use Cases for Iteration 1

### 1. Seller - Create Account
- **Description**: Allows sellers to create a new account.
- **To Test**:
  1. When you load the website, select "Sign Up" and choose "Seller".
  2. Enter a valid username and password (ensure the username does not already exist).
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
  2. Enter a valid username and password (ensure the username does not already exist).
  3. Wait for a successful page response indicating the account has been created.

### 4. Buyer - Login Account
- **Description**: Allows buyers to log in to their account.
- **To Test**:
  1. When you load the website, select "Log In" and choose "Buyer".
  2. Enter a valid username and password (Use amanda1 and amanda1 for username and password).
  3. Wait for a successful page response indicating a valid log in
  4. Ensure successful login and redirection to the seller view items.

### 5. Seller - Review Items
- **Description**: Sellers can review the items they have
- **To Test**:
  1. Log in as a seller.
  2. You will be directed to the seller review items page on login
  3. There will be some test items available to see

### 6. Seller - Publish Items
- **Description**: Sellers can publish items for sale.
- **To Test**:
  1. Log in as a seller.
  2. You will be directed to the seller review items page and will see some test items
  3. From the "seller action" dropdown select "publish item" and then click "Perform Action"
  4. If the item was inactive its status should change to active

### 7. Seller - Unpublish Item
- **Description**: Sellers can unpublish items they have listed.
- **To Test**:
  1. Log in as a seller.
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


