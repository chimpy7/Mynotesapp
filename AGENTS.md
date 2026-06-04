# AGENTS.md

## Project Overview

This project is an examensarbete for a Fullstack JavaScript education.

The application is a fullstack rich document / note-taking / journaling app. The goal is to demonstrate a complete development cycle: planning, architecture, implementation, testing, and deployment.

The application should focus on:

- Secure user authentication
- User-owned rich documents
- Category and subcategory organization
- A dashboard for managing documents
- Clear backend structure
- Secure data handling between frontend, backend, and database
- Deployment on Vercel
- Architecture documentation suitable for an HLD

This is an MVP project. Do not over-engineer unless it clearly supports the examensarbete goals.

---

## Local Workflow

- Do not run `npm run dev`, `next dev`, or otherwise start the local dev server. The user will start the dev server and test the app manually.

---

## Tech Stack

Use the following stack unless explicitly told otherwise:

- Next.js with App Router
- TypeScript
- React
- MongoDB with Mongoose
- Zod for validation
- JWT or secure session-based authentication
- HTTP-only cookies for auth tokens
- Tailwind CSS for styling
- Vercel for deployment
-Lexical for rich text document

Avoid adding large new frameworks or services unless the user explicitly asks for them.

---

## Product Concept

The app is based on a "create first, organize later" workflow.

There should be two main document flows:

1. **Create Document Page**
   - User creates a rich document.
   - The document may initially be uncategorized.
   - The user should not be forced to choose a category immediately.

2. **Document Overview / Organization Page**
   - User sees all documents, especially uncategorized ones.
   - User can move documents into:
     - a main category
     - a subcategory inside a category
     - back to uncategorized

The organization model should support:

```txt
User
 └── Category
      ├── Documents directly in category
      └── Subcategory
           └── Documents inside subcategory


           ## Component Structure and Readability

Prioritize clean component structure and readability.

Do not build large pages with all logic and UI inside one file. Split UI into smaller reusable components when it improves clarity.

Preferred structure:

```txt
src/
  components/
    documents/
      DocumentCard.tsx
      DocumentList.tsx
      DocumentEditor.tsx
      MoveDocumentMenu.tsx
      UncategorizedDocuments.tsx

    categories/
      CategoryTree.tsx
      CategoryCard.tsx
      SubcategoryList.tsx
      CreateCategoryForm.tsx
      CreateSubcategoryForm.tsx

    dashboard/
      DashboardHeader.tsx
      DashboardStats.tsx
      RecentDocuments.tsx

    ui/
      Button.tsx
      Input.tsx
      Modal.tsx
      Dropdown.tsx
