# Vibe Commerce - Full-Stack E-Commerce Cart

A comprehensive **full-stack e-commerce application** built for the **Vibe Commerce screening assignment**.  
This project demonstrates a complete, modern user flow from **product browsing to mock checkout**, including numerous bonus features that simulate a real-world shopping experience.

---

## Demo Video & Screenshots

**Demo Video:**  
https://www.loom.com/share/e3b231d68c404c65b6d2cfabddb963d5

https://www.loom.com/share/ca3e63fc3dd843cda370220ac63c700e

---

## ✨ Core Features

This project successfully implements all requirements from the assignment:

- 🛍 **Product Listing:** Products are fetched live from the [Fake Store API](https://fakestoreapi.com/).  
- 🛒 **Dynamic Cart:** Full cart functionality, including add, remove, and update quantities.  
- 💳 **Checkout Flow:** Multi-step checkout modal with complete form validation.  
- 🧾 **Mock Receipt:** Generates a mock receipt upon successful checkout.  
- 📱 **Responsive Design:** Fully responsive layout for mobile, tablet, and desktop — built with Tailwind CSS.

---

## 🚀 Bonus Features & Enhancements

To showcase advanced capabilities and gain some “brownie points,” these bonus features were also implemented:

- 💰 **Mock Wallet:** Users have a persistent wallet with a starting balance of `$1,000`.  
  - Checkout is **disabled** if the total exceeds wallet balance.  
- 📋 **Order History & Tracking:**  
  - Completed orders are saved to a dedicated “Order History” page.  
  - Users can click “Track” to see a **live simulated tracking page**.  
- ❤️ **Wishlist:** Add products to a wishlist that **persists across sessions**.  
- 💾 **Full Persistence:**  
  - Cart, order history, wishlist, and wallet are stored in **Local Storage**.  
- 🔍 **Search & Filtering:**  
  - Real-time search bar and **dynamic category filters**.  
- 🖥 **Product Quick View:**  
  - Click any product image to open a “Quick View” modal with full description.  
- 💬 **Trivia Chatbot (VibeBot):**  
  - A fun, hardcoded chatbot that offers a flashcard-style **tech trivia game**.
---

## after loom video addtional updates

## 🆕 Added New Features

- **🦴 Product Skeleton Loaders:**  
  Instead of a single spinner, the store page now shows a grid of "skeleton" placeholders while products are loading — creating a smoother, more modern UI experience.

- **🏷️ "On Sale" Products:**  
  Products are now dynamically marked as "On Sale" with a bold "Sale" badge and a slashed-out original price to highlight discounts.

- **🤝 Related Products:**  
  The "Quick View" modal was upgraded to include a "You Might Also Like" section featuring related items from the same category.

- **🕵️‍♂️ Recently Viewed History:**  
  The app now tracks all recently viewed products and displays them in a "Recently Viewed" sidebar with a convenient "Clear History" button.

- **🔔 Multi-Notification Toast System:**  
  Notifications now support multiple concurrent toasts — stacking neatly and fading out individually for rapid actions like quick item additions.

- **👤 Mock Login System:**  
  The Profile sidebar now includes a mock "Log In" / "Log Out" flow to simulate a full user session experience.

- **🎞️ New Sidebar Animations:**  
  Fresh slide-in-from-left/right animations were added in `index.css` to support the new Profile and Mini-Cart sidebars.

- **📦 Stock Inventory Management (Critical Fix):**  
  Prevents adding more items to the cart than available stock (e.g., “Only 5 left!”).

- **🎫 One-Time Promo Code (Critical Fix):**  
  The promo code `VIBE10` is now correctly marked as “Applied” and disabled after one use.

- **🛒 Mini-Cart Sidebar:**  
  Replaced the static cart with a modern slide-in "Mini-Cart" sidebar for a cleaner shopping experience.

- **👥 Profile Sidebar:**  
  Added a new "Profile" sidebar (slide-in) to manage wallet details and simulate user identity for future authentication.

- **⭐ Star Ratings:**  
  Introduced a `StarRating` component to visually display average product ratings.

- **↕️ Product Sorting:**  
  Added a dropdown to sort products by “Popularity,” “Price: Low to High,” and “Price: High to Low.”

- **💸 Promo Code System:**  
  Integrated base promo code logic directly into the cart flow for initial discount functionality.

- **🔥 Bestseller & Low Stock Badges:**  
  Dynamic badges highlight bestsellers and low-stock products to build urgency and engagement.

- **💰 Mock Wallet "Top-up":**  
  Users can now “Add $100” to their wallet balance from the checkout modal if funds are insufficient.

- **💫 "Pulse" Cart Animation:**  
  Added a glowing “pulse” effect on the cart component whenever a new item is added, drawing visual attention to successful actions.

```
ss
```
<img width="1896" height="917" alt="image" src="https://github.com/user-attachments/assets/b96ad8e2-6118-439c-ba7c-7e03baee9de2" />
<img width="1101" height="768" alt="image" src="https://github.com/user-attachments/assets/33ae7778-17f7-4136-aace-2d4ca7e5f448" />
<img width="1501" height="818" alt="image" src="https://github.com/user-attachments/assets/60e77a9d-35ac-48fc-ae80-1107f48eebb4" />
<img width="586" height="530" alt="image" src="https://github.com/user-attachments/assets/b82ddf45-f90d-40ef-9aa4-2acd6b561b95" />
<img width="525" height="505" alt="image" src="https://github.com/user-attachments/assets/6b3c459b-3513-4339-8cb3-37dfbe5c55e5" />
<img width="561" height="887" alt="image" src="https://github.com/user-attachments/assets/74980846-d757-49e5-a428-c23fe2dcbc0a" />

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React (Create React App) |
| **Backend** | Node.js & Express.js |
| **Styling** | Tailwind CSS |
| **API Client** | Axios |
| **API Source** | [Fake Store API](https://fakestoreapi.com/) |

---

