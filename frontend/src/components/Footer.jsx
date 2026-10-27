import { Link } from "react-router";

function Footer() {
  return (
    <footer className="border-t border-verde bg-grafite text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 md:flex-row md:items-start md:justify-between lg:px-10">
        <div className="max-w-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black">JBIFC</span>
          </div>
          <p className="mt-2 text-lg text-white/75">Jogos inspirados no nosso campus</p>
        </div>

        <nav>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 md:justify-end">
            <li><Link to="/" className="block rounded-md py-2 text-lg text-white/85">Início</Link></li>
            <li><Link to="/jogar" className="block rounded-md py-2 text-lg text-white/85">Jogar</Link></li>
            <li><Link to="/ranking" className="block rounded-md py-2 text-lg text-white/85">Ranking</Link></li>
            <li><Link to="/tutorial" className="block rounded-md py-2 text-lg text-white/85">Como jogar</Link></li>
            <li><Link to="/equipe" className="block rounded-md py-2 text-lg text-white/85">Equipe</Link></li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/15">
        <p className="mx-auto max-w-5xl px-6 py-4 text-sm text-white/70">
          Trabalho de Desenvolvimento Web 2, Instituto Federal Catarinense - Campus Concórdia. 2026
        </p>
      </div>
    </footer>
  );
}

export default Footer;