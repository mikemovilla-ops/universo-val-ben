// Logo de la app (public/logo.png, versión pequeña de logo1.png generada
// con scripts/generar-iconos.ps1).
export default function Logo({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="Universo Val-Ben"
      width={size}
      height={size}
      className={`rounded-[22%] object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
