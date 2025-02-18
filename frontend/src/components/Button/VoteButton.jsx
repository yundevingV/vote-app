import React from "react";
import cx from "classnames";

const VoteButton = ({
  text,
  itemId,
  bGColor,
  hoverBgColor,
  isActive,
  isDisabled,
  onClick,
}) => {
  return (
    <button
      onClick={() => onClick(itemId)}
      className={cx(
        {
          "bg-gray-400": isDisabled,
          "cursor-pointer text-white": isActive,
          [bGColor]: isActive,
          [hoverBgColor]: isActive,
        },
        "h-10 p-2 rounded-lg font-semibold"
      )}
      disabled={isDisabled}
    >
      {text}
    </button>
  );
};

export default VoteButton;
