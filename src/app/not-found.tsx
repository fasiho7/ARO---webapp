import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-sm text-teal">404</p>
      <h1 className="display mt-3 text-3xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-muted">
        That page does not exist or is no longer available.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button href="/dashboard">Back to dashboard</Button>
        <Button href="/coding" variant="secondary">
          Coding
        </Button>
      </div>
    </div>
  );
}
