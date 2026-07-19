package com.backend.backend.Controllers;

import com.backend.backend.Model.User;
import com.backend.backend.Repository.UserRepo;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.backend.backend.Services.BrevoEmailService;

import java.time.LocalDateTime;
import java.util.Random;

@RestController
@CrossOrigin(
        origins = {
                "http://localhost:5173",
                "https://visiontalk7.netlify.app"
        },
        allowCredentials = "true"
)
public class Auth {

    @Autowired
    private UserRepo userRepo;

    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

//    @Autowired
//    private JavaMailSender mailSender;

    @Autowired
    private BrevoEmailService brevoEmailService;

    @PostMapping("/register")
    public String register(@RequestBody User userData) {

        User existingUser = userRepo.findByEmail(userData.getEmail());

        if (existingUser != null) {
            return "User already exists";
        }

        String hashedPassword = encoder.encode(userData.getPassword());
        userData.setPassword(hashedPassword);

        userRepo.save(userData);

        return "registration successful";
    }

    @PostMapping("/login")
    public String login(@RequestBody User userData, HttpSession session) {

        User user = userRepo.findByEmail(userData.getEmail());

        if (user == null || !encoder.matches(userData.getPassword(), user.getPassword())) {
            return "Invalid email or password";
        }

        session.setAttribute("email", user.getEmail());
        session.setAttribute("username", user.getUsername());

        return "Login Successful";
    }

//      if (user == null) {
//          return "User not found";
//      }
//
////    String otp = UUID.randomUUID().toString();
//      String otp = String.valueOf(
//              100000 + new Random().nextInt(900000)
//      );
//      user.setOtp(otp);
//      user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
//      userRepo.save(user);
//
//      try {
//
//          brevoEmailService.sendOtp(email, otp);
//
//          return "OTP Sent Successfully";
//
//      } catch (Exception e) {
//
//          e.printStackTrace();
//
//          return "Mail Error : " + e.getMessage();
//      }
////      SimpleMailMessage message = new SimpleMailMessage();
////      message.setFrom("rakesh9106985213@gmail.com");
////      message.setTo(email);
////      message.setSubject("Your Email verification OTP");
////      message.setText("Your OTP is: " + otp);
//
////      try {
////          mailSender.send(message);
////          return "OTP Sent Successfully";
////      } catch (Exception e) {
////          e.printStackTrace();
////          return "Mail Error: " + e.getMessage();
////      }
//
////      return "OTP Sent Successfully";
//

//  @PostMapping("/verifyOtp")
//  public String verifyOTP(@RequestBody User requestData, HttpSession session) {
//      User user = userRepo.findByEmail(requestData.getEmail());
//      if (user == null) {
//          return "User not found";
//      }
//      if(user.getOtpExpiry().isBefore(LocalDateTime.now())) {
//          return "OTP Expired";
//      }
//      if (requestData.getOtp().equals(user.getOtp())) {
//          user.setVerified(true);
//          user.setOtpExpiry(null);
//          user.setOtp(null);
//          userRepo.save(user);
//
//          session.setAttribute("username", user.getUsername());
//          session.setAttribute("email", user.getEmail());
//          return "OTP Verified Successfully";
//      }
//
//      return "OTP not match";
//  }

    @GetMapping("/loggedInUser")
    public User loggedInUser(HttpSession session) {

        String userEmail = (String) session.getAttribute("email");

        if(userEmail == null) {
            return null;
        }

        return userRepo.findByEmail(userEmail);
    }

}
