

function Navbar() {

    return(
        <nav className="w-full flex flex-row bg-verde text-creme justify-between h-16 px-40 items-center text-lg">
            <img src="" alt="JBIFC" />

            <ul className="w-[30%] flex flex-row justify-center items-center gap-6">
                <li><a href="">Início</a></li>
                <li><a href="">Ranking</a></li>
                <li><a href="">Equipe</a></li>
            </ul>

            <button>Jogar</button>
        </nav>
    )
}

export default Navbar