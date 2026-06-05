import PropTypes from "prop-types";
import { getGrad } from "./theme";

export const Avatar = ({ name = "", image, size = 38, style = {} }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, overflow: "hidden", position: "relative", background: getGrad(name), ...style }}>
    {image
      ? <img src={image} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
      : <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: '"Fraunces", serif', fontSize: size * 0.42, color: "rgba(0,0,0,.5)", fontWeight: 500 }}>{name[0]}</span>}
  </div>
);

Avatar.propTypes = {
  name: PropTypes.string,
  image: PropTypes.string,
  size: PropTypes.number,
  style: PropTypes.object,
};

export const Cover = ({ name = "", image, size = 22, radius = 4, style = {} }) => (
  <div style={{ width: size, height: size, borderRadius: radius, flexShrink: 0, overflow: "hidden", position: "relative", background: getGrad(name), ...style }}>
    {image
      ? <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
      : <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: '"Fraunces", serif', fontSize: size * 0.45, color: "rgba(0,0,0,.45)", fontWeight: 500 }}>{name[0]}</span>}
  </div>
);

Cover.propTypes = {
  name: PropTypes.string,
  image: PropTypes.string,
  size: PropTypes.number,
  radius: PropTypes.number,
  style: PropTypes.object,
};
