"use client";
import Web3 from "web3";
import contractABI from "../../abi/contractABI.json";
import cx from "classnames";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const VoteDetail = () => {
  const searchParams = useSearchParams();

  const pollId = searchParams.get("id");
  const router = useRouter();

  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");

  // 스마트 콘트랙트 주소
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  useEffect(() => {
    const loadWeb3AndContract = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        const contractInstance = new web3.eth.Contract(
          contractABI,
          contractAddress
        );
        setContract(contractInstance);

        try {
        } catch (error) {
          alert(
            "계약 호출에 오류가 발생했습니다. ABI와 계약 주소를 확인해 주세요."
          );
        }
      } else {
        alert("메타마스크를 설치해 주세요!");
      }
    };

    loadWeb3AndContract();
  }, []);

  useEffect(() => {
    if (!pollId || !contract) return;

    loadGetPollResult(contract);
    loadGetMyVoterInfo(contract);
  }, [contract, pollId]);

  // vote <- vote detail
  const [voteIndex, setVoteIndex] = useState(-1);

  const handleVote = async () => {
    if (!contract || voteIndex < 0) return;
    await contract.methods.vote(pollId, voteIndex).send({ from: account });

    setVoteIndex(-1);

    await loadGetPollResult(contract);
  };

  const handleDeletePoll = async () => {
    if (!contract || !pollId) return;
    await contract.methods.deletePoll(pollId).send({ from: account });
    await loadGetPollResult(contract);
  };

  // getPollResults <- vote detail
  const [poll, setPoll] = useState([]);
  const [totalVoteCount, setTotalVoteCount] = useState();

  const loadGetPollResult = async (contractInstance) => {
    const newPoll = await contractInstance.methods
      .getPollResults(pollId)
      .call();

    setPoll(newPoll);

    const newTotalVoteCount = newPoll.votes.reduce(
      (accumulator, currentValue) => {
        return accumulator + Number(currentValue);
      },
      0
    );

    setTotalVoteCount(newTotalVoteCount);
  };

  // getMyVoterInfo
  const [myVoterInfo, setMyVoterInfo] = useState();

  const loadGetMyVoterInfo = async (contractInstance) => {
    const newMyVoterInfo = await contractInstance.methods
      .getMyVoterInfo(pollId)
      .call({ from: account });

    setMyVoterInfo(newMyVoterInfo);
  };

  // addCandidate
  const [candidateName, setCandidateName] = useState("");

  const handleAddCandidate = async () => {
    if (!contract && !candidateName) return;

    // 후보자 등록
    await contract.methods
      .addCandidate(pollId, candidateName)
      .send({ from: account });

    setCandidateName("");
    await loadGetPollResult(contract);
  };

  return (
    <>
      {poll.length === 0 ? (
        <div className="flex justify-center items-center h-screen">
          <p>Loading...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-10 ">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push("/")}
                className="text-blue-500 text-left"
              >
                목록으로 돌아가기
              </button>
              <p className="font-bold text-2xl">{poll.question}</p>
              <div className="flex items-center">
                <p
                  className={cx(
                    poll.isActive ? "text-green-600" : "text-red-400",
                    "text-lg font-semibold"
                  )}
                >
                  {poll.isActive ? "진행중" : "종료됨"}
                </p>
                <p className="mx-2">&#183;</p>
                <p className="text-gray-500">{totalVoteCount}표</p>
              </div>
              {myVoterInfo && myVoterInfo.isVoted ? (
                <p className="text-green-600 text-lg font-semibold">
                  🍀 투표 완료
                </p>
              ) : (
                <p className="text-red-400 text-lg font-semibold">
                  🗳️ 소중한 한 표가 필요합니다 !
                </p>
              )}
            </div>
            {account === poll.owner && (
              <form
                className="flex gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddCandidate();
                }}
              >
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="후보자 이름"
                  required
                  className="p-4 w-96 h-12 bg-slate-50 rounded-lg text-black"
                />

                <button
                  className="p-3 bg-emerald-500 text-white rounded-lg  hover:bg-emerald-600"
                  type="submit"
                >
                  등록하기
                </button>
              </form>
            )}
          </div>
          {poll && poll.names ? (
            poll.names.map((name, index) => (
              <div
                key={index}
                className={cx(
                  {
                    "border-2 border-red-500 transition-transform duration-300 translate-x-3 p-10 ":
                      voteIndex === index ||
                      (myVoterInfo &&
                        myVoterInfo.isVoted &&
                        Number(myVoterInfo.votedCandidateIndex) === index),
                  },
                  {
                    "hover:transition-transform hover:duration-300 hover:translate-x-3":
                      myVoterInfo && !myVoterInfo.isVoted,
                  },
                  "p-6 shadow-lg rounded-lg flex flex-col gap-2 bg-zinc-700"
                )}
                onClick={() => {
                  if (!(myVoterInfo && myVoterInfo.isVoted)) {
                    setVoteIndex(index);
                  }
                }}
              >
                <div className="flex justify-between">
                  <p className="font-bold text-2xl">{name}</p>
                  <p className="font-bold text-2xl">
                    {poll.votes[index] > 0 && totalVoteCount > 0
                      ? `${Math.floor(
                          (Number(poll.votes[index]) / Number(totalVoteCount)) *
                            100
                        )} %`
                      : "0%"}
                  </p>
                </div>
                <div className="relative w-full h-2 bg-gray-200 rounded">
                  <div
                    className="absolute h-full bg-red-500 rounded"
                    style={{
                      width: `
                          ${
                            (Number(poll.votes[index]) /
                              Number(totalVoteCount)) *
                            100
                          }%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-400">{poll.votes[index]} 표</p>
                </div>
              </div>
            ))
          ) : (
            <p>Loading...</p>
          )}

          <div className="flex justify-center mt-5 gap-4">
            <button
              onClick={() => handleVote(voteIndex)}
              className={cx(
                { "bg-gray-400": myVoterInfo && myVoterInfo.isVoted },
                {
                  "cursor-pointer  hover:bg-emerald-600 bg-gray-400":
                    myVoterInfo && !myVoterInfo.isVoted,
                },
                "p-3 bg-emerald-500 text-white rounded-lg "
              )}
              disabled={voteIndex === -1}
            >
              투표하기
            </button>
            {poll.owner === account && (
              <button
                onClick={() => handleDeletePoll(pollId)}
                className="cursor-pointer p-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
                disabled={!poll.isActive}
              >
                종료하기
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default VoteDetail;
