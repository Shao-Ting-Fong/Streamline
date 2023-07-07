import { styled } from "@mui/material/styles";
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";

const StyledBadge = styled(Badge)(({ theme, stateColor }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: stateColor,
    color: stateColor,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      // animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

// const SmallAvatar = styled(Avatar)(({ theme }) => ({
//   width: 22,
//   height: 22,
//   border: `2px solid ${theme.palette.background.paper}`,
// }));

export default function BadgeAvatars({ imgUrl, position, showState, stateColor }) {
  return (
    <>
      {showState ? (
        <StyledBadge overlap="circular" anchorOrigin={position} variant="dot" stateColor={stateColor}>
          <Avatar alt="Remy Sharp" src={imgUrl} />
        </StyledBadge>
      ) : (
        <Avatar alt="Remy Sharp" src={imgUrl} />
      )}
    </>
  );
}
