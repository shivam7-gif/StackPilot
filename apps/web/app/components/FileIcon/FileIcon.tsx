import {
  FaJs,
  FaHtml5,
  FaCss3Alt,
  FaPython,
  FaFileAlt,
  FaImage,
} from "react-icons/fa";
import { SiTypescript, SiReact, SiSass } from "react-icons/si";
import { TbJson, TbFile } from "react-icons/tb";

export const FileIcon = ({ extension }: { extension: string }) => {
  const iconProps = { height: "16px", width: "16px" };

  switch (extension) {
    case "jsx":
      return <SiReact color="#61dafb" style={iconProps} />;
    case "tsx":
      return <SiTypescript color="#3178c6" style={iconProps} />;
    case "ts":
      return <SiTypescript color="#3178c6" style={iconProps} />;
    case "js":
      return <FaJs color="yellow" style={iconProps} />;
    case "json":
      return <TbJson color="#f9d71c" style={iconProps} />;
    case "py":
      return <FaPython color="#3776ab" style={iconProps} />;
    case "html":
      return <FaHtml5 color="#e34f26" style={iconProps} />;
    case "css":
      return <FaCss3Alt color="#1572B6" style={iconProps} />;
    case "scss":
      return <SiSass color="#c6538c" style={iconProps} />;
    case "svg":
      return <FaImage color="#ffb400" style={iconProps} />;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "webp":
    case "bmp":
      return <FaImage color="#9acd32" style={iconProps} />;
    case "md":
      return <FaFileAlt color="#ffffff" style={iconProps} />;
    default:
      return <TbFile color="#888888" style={iconProps} />;
  }
};
