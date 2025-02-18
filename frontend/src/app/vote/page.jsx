import VoteContent from "../../components/vote/VoteContent";
import { Suspense } from "react";

const Vote = () => {
  return (
    <Suspense>
      <VoteContent />
    </Suspense>
  );
};

export default Vote;
