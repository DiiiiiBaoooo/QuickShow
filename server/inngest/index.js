import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import sendEmail from "../configs/nodeMailer.js";

export const inngest = new Inngest({ id: "movie-ticket-booking" });

// func to save data to db

const syncUserCreation = inngest.createFunction(
    {id:'sync-user-from-clerk'},
    {event:'clerk/user.created'},
    async ({event})=> {
        const {id,first_name, last_name, email_addresses, image_url}= event.data
        const userData = {
            _id: id,
            email:email_addresses[0].email_address,
            name:first_name + ' ' + last_name,
            image: image_url
        }
        await User.create(userData) 
    

    }
) 
//inngest func to delete data user
const syncUserDeletion = inngest.createFunction(
    {id:'delete-user-with-clerk'},
    {event:'clerk/user.deleted'},
    async ({event})=> {
        
        const {id} = event.data
        await User.findByIdAndDelete(id)
    

    }
)

//inngest func to update data user
const syncUserUpdation = inngest.createFunction(
    {id:'update-user-with-clerk'},
    {event:'clerk/user.updated'},
    async ({event})=> {
        
        const {id,first_name,last_name,email_addresses,image_url} = event.data
        const userData ={
            _id: id,
            email:email_addresses[0].email_address,
            name:first_name + ' ' + last_name,
            image: image_url
        }
        await User.findByIdAndUpdate(id,userData)
    

    }
)
//ingest fuc cancel and release seat of show if payment not made
const releaseSeatsAndDeleteBooking = inngest.createFunction(
    {id:'release-seats-delete-booking'},{
        event:"app/checkpayment"
    },
    async ({event,step})=>{
            const tenMinutesLater = new Date(Date.now()+10*60*1000);
            await step.sleepUntil('wait-for-10-minutes',tenMinutesLater);

            await step.run('check-payment-status',async()=>{
                const bookingId = event.data.bookingId;
                const booking= await Booking.findById(bookingId)

                //if payment is not made, release seats delete booking
                if(!booking.isPaid){
                    const show= await Show.findById(booking.show);
                    booking.bookedSeats.forEach((seat)=>{
                        delete show.occupiedSeats[seat]
                    });
                    show.markModified('occupiedSeats')
                    await show.save()
                    await Booking.findByIdAndDelete(booking._id)
                }
            })
    }
)

//ingest func to send email when user book a show

const  sendBookingConfirmationEmail = inngest.createFunction(
    {id:"send-booking-confirmation-email"},
    {event:"app/show.booked"},
    async({event,step}) =>{
const {bookingId} = event.data;
const booking = await Booking.findById(bookingId).populate({
    path:'show',
    populate:{path:"movie",model:"Movie"}
}).populate('user');

await sendEmail({
    to:booking.user.email,
    subject: `Payment Confirmaion: "${booking.show.movie.title}" booked`,
    body: ` <div style="font-family:Arial, sans-serif; line-height:1.5;">
    <h2>Hi ${booking.user.name},</h2>
    <p>Your booking for <strong style="color: #84565;"${booking.show.movie.title}"</strong> is confirmed.</>
    <p>
        <strong>Date:</strong> ${new Date(booking.show.showDateTime).toLocaleDateString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'})}
        </p>
        <p> Enjoy the show! <3 </p>
        <p> thanks for booking with us <br> - duy bao </p>
        </div>`
})
    }
)
//create emtyp array
export const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation,
    releaseSeatsAndDeleteBooking,
    sendBookingConfirmationEmail
    
];
