const express = require("express");
const bodyParser = require("body-parser");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const multer = require("multer");

const app = express();

// Parse form data
app.use(bodyParser.urlencoded({ extended: false }));


// Set up multer middleware to handle file uploads as well as for Photo upload Mainly 
const storage = multer.memoryStorage();
const upload = multer({ storage });

//this will take all element data from the form
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/gatepass-form.html");
});

// Handle form submission
app.post("/generate-gatepass", upload.single("UserPhoto"),(req, res) => {
  const name = req.body.name;
  const company = req.body.company;
  const purpose = req.body.purpose;
  const PhoneNumber = req.body.PhoneNumber;
  const emailid = req.body.emailid;

  //Getting UserPhoto 
  const photo = req.file;

  //QR Generate code Image for the Gate Pass data are Fetched from UserForm 
  const qrData = {
    Name: name,
    Company: company,
    Purpose: purpose,
    PhoneNumber: PhoneNumber,
    Email_id: emailid,
  };

  const qrDataString = JSON.stringify(qrData);
  QRCode.toDataURL(qrDataString, (err, url) => {
    if (err) throw err;


    // Generate PDF gate pass
    const doc = new PDFDocument();
    
    doc.pipe(res);
    doc.font("Helvetica-Bold");
    doc.fontSize(24).text("Gate Pass For Entry", { align: "center" });
    doc.moveDown();
    
    //this |Block is For QR Scanner AkhileshDetialwillBeShown
    doc.save();
    doc.fontSize(15).text("User QR:");
    doc.image(url, { fit: [150, 150], align: "left" , valign :"top"});//for QRcode movedownRemoved
    
    //This Block will display PhotoThatUserHasGiven
    doc.translate(230,-170);
    doc.fontSize(17).text("User Photo:");
    doc.moveDown(0.50);
    doc.image(req.file.buffer, { fit: [160, 165], align: "left" , valign:"top"}); // User photo
    doc.moveUp(5);
    //Restore the previous State of the Document 
    doc.restore();
    doc.font("Helvetica");
    doc.fontSize(18).text(`Name      : ${name}`);
    doc.moveDown();
    doc.fontSize(17).text(`Company : ${company}`);
    doc.moveDown();
    doc.fontSize(18).text(`Purpose  : ${purpose}`);
    doc.moveDown();
    doc.fontSize(18).text(`Contact   : ${PhoneNumber}`);
    doc.moveDown();
    doc.fontSize(18).text(`Email_ID:  ${emailid}`);
    doc.moveDown(5);

    // Footer
    doc.fontSize(10).text("Developed by: AkhileshKumarTyagi  in India | +91 8795943121 ", { align: "center", width: 500});
    doc.end();
  });
});

// Start server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
