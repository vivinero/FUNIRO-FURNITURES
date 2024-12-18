const axios = require("axios")
const Airtime = require("models/Airtime")
const User = require("models/User")
const {AirtimeSchema} = require('validations/airtime')
const { generateRequestId } = require("helpers/airtimeRecharge")


// TO BUY AIRTIME BY USING VTPASS API
exports.airtimeRecharge = async(req, res) => {
    const {id} = req.user
    const user = await User.find({user:id})
    if(!user){
        return res.status(404).json({
            errors: [{
                error: "User not found",
            }, ],
        });
    }
  
    const body = AirtimeSchema.safeParse(req.body)
    
    if(!body.success) {
        return res.status(400).json({errors: body.error.issues})
    }

    try{

        const airtimeOrder = await Airtime.create({
            user: id,
            requestId: generateRequestId(),
            ...body.data,
        })

        const requestId = generateRequestId();
        // console.log('request_id =>', requestId)
        
        // TO MAKE THE CALL TO VTPASS ENDPOINTS AND BUY THE Airtime.
        const vtPassApiUrl = process.env.VTPASS_API_URL
        // console.log("vtPassApiUrl =>", vtPassApiUrl)

        const vtPassApiKey= process.env.VTPASS_API_KEY
        const vtPassSecretKey = process.env.VTPASS_SECRET_KEY
        const vtPassPublicKey = process.env.VTPASS_PUBLIC_KEY
        // console.log("vtPassApiKey =>", vtPassApiKey)
        // console.log("vtPassSecretKey =>", vtPassSecretKey)
        // console.log("vtPassPublicKey =>", vtPassPublicKey)
        const vtPassApiResponse = await axios.post(
            vtPassApiUrl,
            {
                serviceID: body.data.network,
                amount: body.data.amount,
                phone: body.data.phoneNumber,
                request_id: requestId,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    // "Authorization": `Bearer ${vtPassApiKey}`,
                    "api-key": vtPassApiKey,
                    "secret-key": vtPassSecretKey,
                    "public-key": vtPassPublicKey,
            }
        }
        
        )
        // console.log('VT Pass API Response=>', vtPassApiResponse.data);
        const transactionId = vtPassApiResponse.data.content.transactions.transactionId;
        // console.log('transactionId=>', transactionId);
        //const requestId = vtPassApiResponse.data.content.

        // Update the order status and transaction details in the database
        if(vtPassApiResponse.data.response_description == 'TRANSACTION SUCCESSFUL'){
            airtimeOrder.status = 'delivered';
            airtimeOrder.transactionId = transactionId;
            airtimeOrder.requestId = requestId
             }else if(vtPassApiResponse.data.code == '016'){
                airtimeOrder.transactionId = transactionId;
            airtimeOrder.status = 'failed';           
        }

        await airtimeOrder.save();
    //TODO
    // Send a confirmation email to the user

    if (airtimeOrder.status === 'delivered') {
        return res.status(200).json({ message: vtPassApiResponse.data});
    } else {
        return res.status(400).json({ message: vtPassApiResponse.data.response_description });
    }
    } catch (error) {
        console.error('RECHARGE AIRTIME ERROR=>', error);
        res.status(500).json({
          errors: [
            {
              error: "Server Error",
            },
          ],
        });
      }

   
}

// QUERY TRANSACTION STATUS
exports.queryTransactionStatus = async (req, res) => {
    try {
        const {requestId} = req.body;
     
        const vtPassApiUrl = process.env.VTPASS_API_URL_QUERY
        const vtPassApiKey= process.env.VTPASS_API_KEY
        const vtPassSecretKey = process.env.VTPASS_SECRET_KEY
        const vtPassPublicKey = process.env.VTPASS_PUBLIC_KEY
      
        const vtPassApiResponse = await axios.post(
            vtPassApiUrl,
            {
                request_id: requestId,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    "api-key": vtPassApiKey,
                    "secret-key": vtPassSecretKey,
                    "public-key": vtPassPublicKey,
            }
        }
        
        )
        console.log('VT Pass API Response=>', vtPassApiResponse.data);
         return res.status(200).json({data: vtPassApiResponse.data})
     
     
    } catch (error) {
        console.log("TRANSACTION QUERY ERROR=>", error)
        res.status(500).json({
          errors: [
            {
              error: "Server Error",
            },
          ],
        });
      }
  
}

// GET ALL AIRTIME TRANSACTIONS
exports.getAllAirtimeTransactions = async (req, res) => {
    try {
        const {id} = req.user
        console.log("ID=>", id)
        const user = await User.findById(id)
        console.log("USER=>", user)
        if (!user) {
            return res.status(404).json({
                errors: [{
                    error: "User not found",
                }, ],
            });
        }
        allAirtimeTransaction = await Airtime.find({user:id}).exec()
        if(!allAirtimeTransaction){
            return res.status(404).json({
                errors: [{
                    error: "Airtime transactions not found",
                }, ],
            });
        }
        
        return res.status(200).json({data: allAirtimeTransaction})

        } catch (error) {
            console.log("GET ALL AIRTIME TRANSACTIONS ERROR=>", error)
            res.status(500).json({
              errors: [
                {
                  error: "Server Error",
                },
              ],
            });
          }
}

exports.checkAirtimeCountries = async (req, res) =>{
    try {
        const {id} = req.user
        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({
                errors: [{
                    error: "User not found",
                }, ],
            });
            }

             
        // TO MAKE THE CALL TO VTPASS ENDPOINTS AND BUY THE Airtime.
        const vtPassApiUrl = process.env.VTPASS_API_URL_COUNTRIES
        // console.log("vtPassApiUrl =>", vtPassApiUrl)

        const vtPassApiKey= process.env.VTPASS_API_KEY
        const vtPassSecretKey = process.env.VTPASS_SECRET_KEY
        const vtPassPublicKey = process.env.VTPASS_PUBLIC_KEY
       
        const vtPassApiResponse = await axios.post(
            vtPassApiUrl,
            {
                headers: {
                    'Content-Type': 'application/json',
                    "api-key": vtPassApiKey,
                    "secret-key": vtPassSecretKey,
                    "public-key": vtPassPublicKey,
            }
        }
        
        )
        // console.log('VT Pass API Response=>', vtPassApiResponse.data);

        // Update the order status and transaction details in the database
        if(vtPassApiResponse.data.response_description == 'TRANSACTION SUCCESSFUL'){
            airtimeOrder.status = 'delivered';
            airtimeOrder.transactionId = transactionId;
            airtimeOrder.requestId = requestId
             }else if(vtPassApiResponse.data.code == '016'){
                airtimeOrder.transactionId = transactionId;
            airtimeOrder.status = 'failed';           
        }


        await airtimeOrder.save();
    //TODO
    // Send a confirmation email to the user

    if (airtimeOrder.status === 'delivered') {
        return res.status(200).json({ message: vtPassApiResponse.data.response_description });
    } else {
        return res.status(400).json({ message: vtPassApiResponse.data.response_description });
    }
    }
    catch (error) {
        console.error('GET AIRTIME COUNTRIES ERROR=>', error);
        res.status(500).json({
          errors: [
            {
              error: "Server Error",
            },
          ],
        });
      }
}

