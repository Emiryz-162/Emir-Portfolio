import { Container } from "@/components/ui/container";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/80 py-8">
      <Container className="flex flex-col gap-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Muhammet Emir Yilmaz.</p>
        <p>Social links and contact details will live here.</p>
      </Container>
    </footer>
  );
}
