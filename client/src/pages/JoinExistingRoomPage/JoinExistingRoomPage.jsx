import './JoinExistingRoomPage.scss'

const JoinExistingRoomPage = () => {
  return (
    <div className="join-existing-room-page">
      <input placeholder='Enter Room ID' className='join-room-input' />
      <button>Join Existing Room</button>
    </div>
  )
}

export default JoinExistingRoomPage;