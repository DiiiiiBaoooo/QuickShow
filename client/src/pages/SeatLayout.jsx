import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assets, dummyDateTimeData, dummyShowsData } from '../assets/assets';
import Loading from '../components/Loading';
import { ClockIcon, TicketCheckIcon } from 'lucide-react';
import isoTimeFormat from '../lib/isoTimeFormat';
import BlurCircle from '../components/BlurCircle';
import toast from 'react-hot-toast';

const SeatLayout = () => {
  const groupRows = [['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H'], ['I', 'J']];
  const allRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const { id, date } = useParams();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);
  const navigate = useNavigate();

  const getShow = async () => {
    const show = dummyShowsData.find((show) => show._id === id);
    if (show) {
      setShow({
        movie: show,
        dateTime: dummyDateTimeData,
      });
    }
  };

  // Hàm kiểm tra hàng có liền kề không
  const areRowsAdjacent = (rows) => {
    if (rows.length <= 2) {
      if (rows.length === 1) return true;
      const indices = rows.map(row => allRows.indexOf(row)).sort((a, b) => a - b);
      return indices[1] - indices[0] === 1; // Hai hàng phải liền kề
    }
    return false;
  };

  // Hàm kiểm tra ghế tách lẻ trong một hàng
  const isOrphanedSeatCreatedInRow = (row, currentSelectedSeats, bookedSeats = [], newSeatId = null) => {
    const rowSeats = Array(9).fill(0); // 9 ghế mỗi hàng
    // Đánh dấu ghế đã chọn
    currentSelectedSeats.forEach((seat) => {
      if (seat.startsWith(row)) {
        const num = parseInt(seat.slice(1));
        rowSeats[num - 1] = 1;
      }
    });
    // Đánh dấu ghế đã đặt
    bookedSeats.forEach((seat) => {
      if (seat.startsWith(row)) {
        const num = parseInt(seat.slice(1));
        rowSeats[num - 1] = 1;
      }
    });
    // Đánh dấu ghế mới (nếu có)
    if (newSeatId && newSeatId.startsWith(row)) {
      const seatNumber = parseInt(newSeatId.slice(1));
      rowSeats[seatNumber - 1] = 1;
    }

    // Kiểm tra ghế trống đơn lẻ
    for (let i = 0; i < rowSeats.length; i++) {
      if (rowSeats[i] === 0) {
        const leftOccupied = i > 0 && rowSeats[i - 1] === 1;
        const rightOccupied = i < rowSeats.length - 1 && rowSeats[i + 1] === 1;
        if (leftOccupied && rightOccupied) {
          return true; // Tạo ghế trống đơn lẻ
        }
      }
    }
    return false;
  };

  const handleSeatClick = (seatId) => {
    if (!selectedTime) {
      return toast('Please select Time first');
    }
    if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5) {
      return toast('Only select up to 5 seats');
    }

    const normalizedSeatId = seatId.toUpperCase();
    const row = normalizedSeatId[0];
    const bookedSeats = selectedTime?.bookedSeats || [];

    // Nếu chọn ghế mới
    if (!selectedSeats.includes(normalizedSeatId)) {
      // Kiểm tra hàng liền kề
      const currentRows = [...new Set(selectedSeats.map(seat => seat[0]))];
      const newRows = [...new Set([...currentRows, row])];
      if (!areRowsAdjacent(newRows)) {
        return toast('Please select seats in two adjacent rows only (e.g., A-B or B-C)');
      }

      // Kiểm tra ghế tách lẻ trong hàng của ghế mới và hàng liền kề
      const adjacentRowIndex = allRows.indexOf(row);
      const adjacentRows = [row];
      if (adjacentRowIndex > 0) adjacentRows.push(allRows[adjacentRowIndex - 1]);
      if (adjacentRowIndex < allRows.length - 1) adjacentRows.push(allRows[adjacentRowIndex + 1]);

      for (const checkRow of adjacentRows) {
        if (isOrphanedSeatCreatedInRow(checkRow, selectedSeats, bookedSeats, normalizedSeatId)) {
          return toast('Cannot select this seat as it creates an orphaned seat');
        }
      }
    }

    // Cập nhật selectedSeats
    setSelectedSeats((prev) =>
      prev.includes(normalizedSeatId)
        ? prev.filter((seat) => seat !== normalizedSeatId)
        : [...prev, normalizedSeatId]
    );
  };

  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex gap-2 mt-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: count }, (_, i) => {
          const seatId = `${row}${i + 1}`;
          const isBooked = selectedTime?.bookedSeats?.includes(seatId) || false;
          return (
            <button
              key={seatId}
              onClick={() => handleSeatClick(seatId)}
              disabled={isBooked}
              className={`h-8 w-8 rounded border border-primary/60 cursor-pointer ${
                isBooked
                  ? 'bg-gray-500 cursor-not-allowed'
                  : selectedSeats.includes(seatId)
                  ? 'bg-primary text-white'
                  : ''
              }`}
            >
              {seatId}
            </button>
          );
        })}
      </div>
    </div>
  );

  useEffect(() => {
    getShow();
  }, []);

  return show ? (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 placeholder-yellow-300 md:pt-50">
      {/* Available timings */}
      <div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30">
        <p className="text-lg font-semibold px-6">Available Timings</p>
        <div className="mt-5 space-y-1">
          {show.dateTime[date].map((item) => (
            <div
              key={item.time}
              onClick={() => setSelectedTime(item)}
              className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${
                selectedTime?.time === item.time ? 'bg-primary text-white' : 'hover:bg-primary/20'
              }`}
            >
              <ClockIcon className="w-4 h-4" />
              <p className="text-sm"> {isoTimeFormat(item.time)}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Seats layout */}
      <div className="relative flex-1 flex flex-col items-center max-md:mt-16">
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle bottom="0" right="0" />
        <h1 className="text-2xl font-semibold mb-4">Select Your Seats</h1>
        <img src={assets.screenImage} alt="screen" />
        <p className="text-gray-400 text-sm mb-6">SCREEN SIDE</p>
        <div className="flex flex-col items-center mt-10 text-xs text-gray-300">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6">
            {groupRows[0].map((row) => renderSeats(row))}
          </div>
          <div className="grid grid-cols-2 gap-11">
            {groupRows.slice(1).map((group, idx) => (
              <div key={idx} className="">
                {group.map((row) => renderSeats(row))}
              </div>
            ))}
          </div>
        </div>
         <button onClick={()=>navigate('/my-bookings')} className='flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium 
       cursor-pointer active:scale-95'>
          Proceed to Checkout <TicketCheckIcon className='w-4 h-4' strokeWidth={3} />
        </button>
      </div>
    </div>
  ) : (
    <div className="mt-20">
      <Loading />
    </div>
  );
};

export default SeatLayout;