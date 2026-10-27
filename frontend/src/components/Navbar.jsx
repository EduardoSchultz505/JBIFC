import { Link } from "react-router";

function Navbar() {
  return (
    <nav className="w-full bg-verde text-creme h-16 px-6 md:px-10 lg:px-20 flex items-center justify-between text-lg shadow-lg shadow-verde-escuro/20">
      <Link to="/" className="font-bold tracking-wide">JBIFC</Link>

      <ul className="hidden md:flex items-center justify-center gap-6">
        <li><Link to="/" className="transition hover:opacity-80">Início</Link></li>
        <li><Link to="/ranking" className="transition hover:opacity-80">Ranking</Link></li>
        <li><Link to="/equipe" className="transition hover:opacity-80">Equipe</Link></li>
      </ul>

      <Link to="/jogar" className="bg-vermelho px-4 py-2 rounded-lg font-semibold shadow-botao transition hover:translate-y-0.5 hover:shadow-none">
        Jogar
      </Link>
    </nav>
  );
}

export default Navbar;