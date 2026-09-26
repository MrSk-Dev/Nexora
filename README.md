# Nexora

Nexora is a full-stack multi-vendor e-commerce web application built on the MERN stack. It features a Flipkart-style product catalog with a glassmorphism UI,
and supports three distinct user roles: **customer**, **vendor**, and **admin**.

## Features

- **Authentication & Authorization** — JWT-based auth with role-based access control (`protect`, `authorize`, `requireApprovedVendor` middleware)
- **Two-layer approval system** — Admins approve vendor accounts and individual products separately before they go live on the storefront
- **Vendor management** — Vendor registration, "Sell on Nexora" upgrade path, suspend/reactivate
- **Product management** — Add, edit, activate/deactivate products; product edits reset approval status for admin review
- **Customer experience** — Public browsing for guests, product search & filter, cart, wishlist, Buy Now flow
- **Orders** — Cash on Delivery (COD), with order items snapshotted at purchase time so later price changes don't affect past orders
- **Admin dashboard** — Manage vendors and products across the platform

## Tech Stack

**Frontend:** React (Vite), React Router, Axios, custom CSS design system with glassmorphism/Aurora gradient aesthetics

**Backend:** Node.js, Express, MongoDB with Mongoose, JWT, Multer (file uploads)

## User Roles

| Role | Capabilities |
|------|-------------|
| **Customer** | Browse products, search/filter, cart, wishlist, place orders |
| **Vendor** | Manage product listings, view orders, apply for vendor approval |
| **Admin** | Approve/suspend vendors, approve/reject products, manage platform |

## License

This is a personal project by [MrSk-Dev](https://github.com/MrSk-Dev).
