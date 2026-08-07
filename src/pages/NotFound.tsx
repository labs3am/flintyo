import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="panel max-w-md rounded-3xl p-8 text-center">
        <h1 className="text-6xl font-black text-gradient">404</h1>
        <h2 className="mt-3 text-lg font-semibold">This table doesn't exist</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for isn't here. Head back and start a new game.
        </p>
        <Link to="/" className="btn-primary mt-6 inline-flex">
          Back to the menu
        </Link>
      </div>
    </main>
  );
}
