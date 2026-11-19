import { iniciales } from "@/lib/familia";

// Foto redonda de una persona, o sus iniciales si todavía no tiene foto.
export default function Avatar({
  nombre,
  fotoUrl,
  size = 48,
  className = "",
}: {
  nombre: string;
  fotoUrl: string | null;
  size?: number;
  className?: string;
}) {
  if (fotoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={fotoUrl}
        alt={nombre}
        width={size}
        height={size}
        loading="lazy"
        className={`rounded-full object-cover bg-corteza ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-miel/20 text-mielbrillante font-display font-semibold ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-label={nombre}
    >
      {iniciales(nombre)}
    </span>
  );
}
