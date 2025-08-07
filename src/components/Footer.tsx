import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-6 mt-12 border-t border-gray-200 dark:border-white/10">
      <div className="max-w-screen-lg mx-auto px-4 text-center text-sm text-gray-600 dark:text-white/50">
        <p className="mb-1 text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()}{" "}
          <Link
            href="https://werioliveira.site"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-50 dark:text-white hover:underline"
          >
            Weri Oliveira
          </Link>
          . Todos os direitos reservados.
        </p>

      </div>
    </footer>
  );
}
