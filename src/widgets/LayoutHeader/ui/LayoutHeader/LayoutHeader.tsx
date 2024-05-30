import { FC } from "react";
import { Logo } from "@/widgets";
import Menu from "../Menu/Menu";

const LayoutHeader: FC = () => {
  return (
    <>
      <header>
        <nav className="navbar bg-base-100">
          <Menu
            links={[
              { name: "Operatore", href: "/" },
              { name: "Direttore di filiale", href: "/filiale_overview" },
              // { name: "About", href: "/about" },
            ]}
          />
          <Logo logoName={"Demo"} />
        </nav>
      </header>
    </>
  );
};

export default LayoutHeader;
