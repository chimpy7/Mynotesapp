# Notes - 

Notes is a fullstack rich document and note-taking application built as an examensarbete project for a Fullstack JavaScript education.

The application demonstrates a complete MVP development cycle with authentication, user-owned data, document creation, document organization, backend API routes, database models, validation, and deployment readiness.

## Core Idea

The product follows a create first, organize later workflow.

Users can start writing immediately without choosing a category. Saved documents can later be organized from the document overview page into categories, subcategories, or moved back to an unorganized state.

```txt
User
  Category
    Documents directly in category
    Subcategory
      Documents inside subcategory
```

## Features

- Authentication with Clerk
- Protected application routes
- User records synchronized into MongoDB
- Rich text document editor powered by Lexical
- Autosaved document drafts
- Create and edit documents
- View all saved documents
- Create categories and subcategories
- Drag documents between unorganized, category, and subcategory areas
- Remove documents from categories
- Delete documents, categories, and subcategories with confirmation
- Request validation with Zod
- MongoDB persistence with Mongoose

## Tech Stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- Clerk authentication
- MongoDB
- Mongoose
- Zod
- Lexical
- Vercel deployment target

## Project Structure

```txt
app/
  api/
    categories/
    documents/
  documents/
  sign-in/
  sign-up/
  write/

components/
  categories/
  documents/
  editor/
  layout/
  ui/

lib/
  categoryAccess.ts
  db.ts
  documentLimits.ts
  users.ts

models/
  Category.ts
  Document.ts
  User.ts

schemas/
  category.ts
  common.ts
  document.ts
```

## Main Pages

### Landing Page

`/` is the public entry page. Signed-in users are redirected to the document overview.

### Write Page

`/write` is the rich document editor. Users can create a new document without selecting a category first.

`/write?documentId=<id>` opens an existing document owned by the signed-in user.

### Documents Page

`/documents` is the organization view. It shows unorganized documents and category boards where documents can be moved into categories and subcategories.

## API Overview

The API routes are implemented with Next.js route handlers.

- `POST /api/documents` creates a document
- `PATCH /api/documents/:documentId` updates document content or organization
- `DELETE /api/documents/:documentId` deletes a document
- `POST /api/categories` creates a category
- `DELETE /api/categories/:categoryId` deletes a category
- `POST /api/categories/:categoryId/subcategories` creates a subcategory
- `DELETE /api/categories/:categoryId/subcategories/:subcategoryId` deletes a subcategory

All protected API routes require an authenticated Clerk user. Database queries are scoped by `userId` so users can only access their own documents and categories.

## Data Model

### User

Stores the Clerk user id, email, profile metadata, and last seen timestamp.

### Document

Stores the owner id, title, Lexical content, optional category id, optional subcategory id, and timestamps.

### Category

Stores the owner id, category name, embedded subcategories, and timestamps.

## Environment Variables

Create `.env.local` with the required local values:

```env
MONGODB_URI=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

The same variables must be configured in Vercel for deployment.

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Deployment

The project is designed for Vercel deployment.

Before deploying:

1. Add the environment variables in Vercel.
2. Make sure MongoDB allows connections from the deployment environment.
3. Configure Clerk with the deployed application URL.
4. Run `npm run build` locally to verify the production build.

## MVP Scope

This project intentionally focuses on the core examensarbete goals:

- Secure authentication
- User-owned document data
- Rich text writing
- Category and subcategory organization
- Clear backend structure
- Validation and secure data handling
- Deployment-ready architecture

Future improvements could include search, sharing, richer dashboard statistics, export formats, and more advanced editor features.
