import { Link } from "react-router"

function Footer() {
    
    return(
        <footer className="border-verde bg-grafite text-white">
            <div className="mx-auto flex px-40 gap-8 py-10 flex-row justify-between">
                <div className="max-w-sm">
                    <div className="flex text-center">
                        <img src="" alt="JBIFC"/>
                        <p className="text-2xl">JBIFC</p>
                    </div>
                    <p className="mt-2 text-lg text-white/75">Jogos inspirados no nosso campus</p>
                </div>
                <nav>
                    <ul className="flex flex-wrap gap-x-6 gap-y-1 justify-end">
                        <li><Link to="/" className="block rounded-md py-2 text-lg text-white/85">Início</Link></li>
                        <li><Link to="jogar" className="block rounded-md py-2 text-lg text-white/85">Jogar</Link></li>
                        <li><Link to="ranking" className="block rounded-md py-2 text-lg text-white/85">Ranking</Link></li>
                        <li><Link to="tutorial" className="block rounded-md py-2 text-lg text-white/85">Como jogar</Link></li>
                        <li><Link to="equipe" className="block rounded-md py-2 text-lg text-white/85">Equipe</Link></li>
                    </ul>
                </nav>
            </div>
            <div className="border-t border-white/15">
                <p className="mx-auto max-w-5xl py-4 text-sm text-white/70">Trabalho de Desenvolvimento Web 2, Instituto Federal Catarinense - Campus Concórdia. 2026 </p>
            </div>
        </footer>
    )
}

export default Footer