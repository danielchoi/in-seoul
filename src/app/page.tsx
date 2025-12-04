import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <main className="flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold">in-seoul</h1>
        <p className="text-muted-foreground">Welcome to in-seoul</p>
        <ThemeToggle />
      </main>
    </div>
  );
}
