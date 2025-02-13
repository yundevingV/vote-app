// SPDX-License-Identifier: GPL-3.0

pragma solidity >= 0.7.0 < 0.9.0;

contract Vote {

    struct Candidate {
        string name;
        uint upVote;
    }

    struct Voter {
        bool isVoted; // 투표 여부
    }

    struct Poll {
        string question;
        Candidate[] candidates; // 후보자 목록
        mapping(address => Voter) voters; // 투표자 정보
        address owner;
        bool isActive;
        address[] voterAddresses; // 투표자 주소 배열 추가
    }

    Poll[] public polls;

    // 투표 이벤트
    event CreatePoll(uint pollId, string question, address owner);

    // 투표 생성하기
    function createPoll(string memory _question) public {
        Poll storage newPoll = polls.push();
        newPoll.question = _question;
        newPoll.owner = msg.sender;
        newPoll.isActive = true;

        emit CreatePoll(polls.length - 1, _question, msg.sender);
    }

    // 후보자 추가
    function addCandidate(uint _pollId, string memory _name) public {
        Poll storage poll = polls[_pollId];
        require(msg.sender == poll.owner, "Only the owner can add candidates");
        poll.candidates.push(Candidate(_name, 0));
    }
    
    // 투표하기    
    function vote(uint _pollId, uint _candidateIndex) public {
        Poll storage poll = polls[_pollId];
        require(poll.isActive, "Poll is not active");
        require(!poll.voters[msg.sender].isVoted, "You have already voted");
        require(_candidateIndex < poll.candidates.length, "Invalid candidate index");

        poll.voters[msg.sender].isVoted = true; // 투표 여부 설정
        poll.candidates[_candidateIndex].upVote++; // 해당 후보자에게 투표 추가

        // 투표자 주소를 배열에 추가
        poll.voterAddresses.push(msg.sender);
    }

    function getAllPoll() public view returns (
        string[] memory questions, 
        address[] memory owners, 
        bool[] memory isActive, 
        Candidate[][] memory candidates,
        bool[][] memory voterStatus // 수정된 부분
    ) {
        uint256 pollCount = polls.length;
        questions = new string[](pollCount);
        owners = new address[](pollCount);
        isActive = new bool[](pollCount);
        candidates = new Candidate[][](pollCount);
        voterStatus = new bool[][](pollCount); // 각 투표자의 투표 여부 배열 초기화

        for (uint256 i = 0; i < pollCount; i++) {
            questions[i] = polls[i].question; 
            owners[i] = polls[i].owner; 
            isActive[i] = polls[i].isActive;
            candidates[i] = polls[i].candidates;

            // 각 투표자에 대한 투표 여부를 가져오기
            uint256 voterCount = polls[i].voterAddresses.length;
            voterStatus[i] = new bool[](voterCount); // 각 투표의 투표자 수에 맞게 배열 초기화

            for (uint256 j = 0; j < voterCount; j++) {
                address voterAddr = polls[i].voterAddresses[j];
                voterStatus[i][j] = polls[i].voters[voterAddr].isVoted; // 해당 주소의 투표 여부 저장
            }
        }

        return (questions, owners, isActive, candidates, voterStatus); 
    }
    
    // 투표 결과 조회
    function getPollResults(uint _pollId) public view returns (string memory question, address owner, bool isActive, string[] memory names, uint[] memory votes) {
        Poll storage poll = polls[_pollId];

        question = poll.question;
        owner = poll.owner;
        isActive = poll.isActive;
        names = new string[](poll.candidates.length);
        votes = new uint[](poll.candidates.length);

        for (uint i = 0; i < poll.candidates.length; i++) {
            names[i] = poll.candidates[i].name;
            votes[i] = poll.candidates[i].upVote;
        }

        return (question,owner,isActive,names,votes);
    }

    // 투표 참여 여부 조회
    function getHasVoted(uint _pollId) public view returns (bool) {
        Poll storage poll = polls[_pollId];
        return poll.voters[msg.sender].isVoted; // 사용자의 투표 여부 반환
    }


    // 생성된 투표 수 조회
    function getPollCount() public view returns (uint) {
        return polls.length;
    }
}