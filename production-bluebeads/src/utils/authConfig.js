// Import the Firebase Admin SDK
import admin from 'firebase-admin';

admin.initializeApp({
    credential: admin.credential.cert({
        "type": "service_account",
        "project_id": "bluebeads-auth",
        "private_key_id": "b8532eb0b40ffae780d9923b61a6e3c487128868",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCeqSClWIwehysc\noW5DddJ/Hk0eji+r0abqJPi/GAA7FLZRnlycViO2ZeiiITNZaaFehFSV4U1HcEdT\nlUT5U0QdGrHz3EqU5lhJV+f2BZ9MCF6918SP+sU9Sgm8RiOxYyTjELFKGS2fC9Dj\nD2sj32+6q2ULchtBPUSzljP4AQ+s1xjxCgKBn196vE67So9hDPKiTDpERRQ5NZSu\nlhcdIuFKbTtvYLomDz9tmhOIlDQtIPUeZS9ZxYLDPcqiiVIJGN3YTCtaVT9qqDza\n8XFJ0g/tAmaQcK1Igw7Q5ozEtUG5yDZNpmr3mYQfHPySZmS7TYlgIibP9mJaUSMQ\n3vBd83Y3AgMBAAECggEAEJ/iFtEvZWd+YfKcTh9DXiR7qi712cgO+EvFcKiAJbCm\n5eh1BcCU32DQPmTCL6U8zl2JS2cfJNQj9SMX5hQOeAo7CTVU70MvjwfR+1pddacO\n3k+Efh2lmyVt3bdvt/+Oduhh20TGHfsr+Q69iDW6TFH3NXrQVkaoMzUS3vKlhNOe\ns9eeGQpJA4NgvZFx/0g3oJkPH36Y6wTscBmZMRWv06lA/MvwZcbiHDrAFrIB85rd\n7a23GFxYpWKxOqtPXSA2pWFa7WjwUynO8QN3QDL8cSLliyBGQs2EQ9MevpFaJ45c\nrMLs5Pk6wxbR6qEkpbTR6i9torrYYihuw6o9sS9VIQKBgQDUOT70/Snshrxeoaqa\n4gf3sfENVB13Bjw7tuoMoC2ic2RRAsbkrd8KmRw1BM2/jiW3stC7Mqr8PeWLc5J8\ndbAHh6big1lMUMsrOW5R/zSVFvYcinRh0uwZcYXiq+fSP2T9VZpPpWcA/3dF1dG0\nj7tv8gix8WFfdxVDXJoDQ4DpEQKBgQC/Y2rMeh42YYziFb2lXIcXBHYtLa0/Hoz1\nUV2he57VlhcrcC64z9wbg001D8taNEGarH9JigcQsIoRISaNFnatLF9WFTWE+Q1q\nsugaa5lRYGFpJq/IRN+Tr9mnPOxGsoyFFu4I6J3QK0HEQJ+ZztarwLxgLF3x41C3\nU5pIkmmqxwKBgQCD4HLr4Gnt7igeEg4nIvBajnvBkZShwwEpBlhYsizJdzVOVhBs\nSFOCjXSGyc5lC5sKlRa6TRkNmBUNXCsaJjPV6gjdV0vlbYti99RDJfhx8QvM3ojF\nxUEr6myNV8+9yeEiv9AdUCY664Udo2ol7u9F+DxI/ztIDILtEh0ujAMOUQKBgCHL\nOCxq07LefrXdCOON9vyFeSh5DEI87r7SYyoEXgNwwR6WbGmNqlvhT1yzMUD4QS1C\nkCc4DA9SXM6xf9EhykrBrwPQMucL4uaYOIuRvDy2O/0JK7i9EI1PW6tAAqhpFo7Z\ngaZpDJSZTr+MeaH698TT/28r5lqzvKjiRjfSQn45AoGBAJ5GziRUQzrg1QBMXPRI\nVRtc/d4FBSjQOaSYbN4qGzgRIk9QLmaWoeyca9ZX0jJrs6SwlwmrM54KiT24qjRK\nB2G4tZmd3Rqg+cbWWaH+U/cS7r8ROSGWBcvWprq5UgoN+HWgJwbPuPIg6a4WN3i7\nHyclmkoF0va0YNbRyW3xvqgi\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-z6vu5@bluebeads-auth.iam.gserviceaccount.com",
        "client_id": "107588682762781462778",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-z6vu5%40bluebeads-auth.iam.gserviceaccount.com",
        "universe_domain": "googleapis.com"
      })
});

// Export the initialized Firebase Admin SDK instance
export { admin };
