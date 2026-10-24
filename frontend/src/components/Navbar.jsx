import { Link } from "react-router"

function Navbar() {

    return(
        <nav className="w-full flex flex-row bg-verde text-creme justify-between h-16 px-40 items-center text-lg">
            <img src="" alt="JBIFC" />

            <ul className="w-[30%] flex flex-row justify-center items-center gap-6">
                <li><Link to="/">Início</Link></li>
                <li><Link to="/ranking">Ranking</Link></li>
                <li><Link to="/equipe">Equipe</Link></li>
            </ul>

            <Link className="bg-vermelho p-2 rounded-lg">Jogar</Link>
        </nav>
    )
}

export default Navbar