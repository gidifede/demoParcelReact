import { FC } from "react";
import { Logo } from "@/widgets/LayoutHeader/model/types";

async function clearAll() {
  localStorage.clear()

  console.log(await fetch("https://yra47nv6ctdhkl3yu2d4p7tzge0eixmp.lambda-url.eu-central-1.on.aws/"))


}

const Logo: FC<Logo> = ({ logoName }: Logo) => {
  return (
    <div className="navbar-center">
      <a className="btn-ghost btn text-xl normal-case" onClick={() => clearAll()}>{logoName}</a>
    </div>
  );
};

export default Logo;
