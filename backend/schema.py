from datetime import date

from pydantic import BaseModel, Field

# API schema models used for request validation


# Common fields for Student and Employee
class UserDetails(BaseModel):
    firstName: str = Field(
        ...,
        pattern=r"^[A-Za-z .'-]{2,50}$",
        example="John",
    )
    middleName: str | None = Field(
        None,
        pattern=r"^[A-Za-z .'-]{0,50}$",
        example="A.",
    )
    lastName: str = Field(
        ...,
        pattern=r"^[A-Za-z .'-]{2,50}$",
        example="Doe",
    )
    email: str = Field(
        ...,
        pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        example="john.doe@example.com",
    )
    dob: date = Field(..., example="1998-05-12")
    gender: str = Field(
        ...,
        pattern=r"^(Male|Female|Other|Prefer not to say)$",
        example="Male",
    )
    phone: str = Field(
        ...,
        pattern=r"^\+?[0-9]{10,15}$",
        example="9876543210",
    )
    address: str | None = Field(
        None,
        min_length=5,
        max_length=200,
        example="12 Main Street",
    )
    country: str = Field(
        ...,
        pattern=r"^[A-Za-z .'-]{2,50}$",
        example="India",
    )
    state: str = Field(
        ...,
        pattern=r"^[A-Za-z .'-]{2,50}$",
        example="Karnataka",
    )
    zip: str | None = Field(
        None,
        pattern=r"^[A-Za-z0-9 -]{3,10}$",
        example="560001",
    )
    status: str = Field(
        "Active",
        pattern=r"^[A-Za-z .'-]{2,50}$",
        example="Active",
    )


# Student academic details
class AcademicsDetails(BaseModel):
    class_name: str = Field(
        ...,
        pattern=r"^[A-Za-z0-9 .'-]{1,50}$",
        example="10",
    )
    division: str = Field(
        ...,
        pattern=r"^[A-Za-z0-9 .'-]{1,20}$",
        example="A",
    )
    subjects: str = Field(
        ...,
        pattern=r"^[A-Za-z ,.-]{2,200}$",
        example="Mathematics",
    )
    batch: str = Field(
        ...,
        pattern=r"^[A-Za-z0-9 .'-]{1,30}$",
        example="Morning",
    )


# Student = UserDetails + AcademicsDetails + guardianPhone
class StudentDetails(UserDetails, AcademicsDetails, BaseModel):
    guardianPhone: str | None = Field(
        None,
        pattern=r"^\+?[0-9]{10,15}$",
        example="9876543211",
    )




# Employee = UserDetails + empId
class EmployeeDetails(UserDetails, BaseModel):
    empId: str = Field(
        ...,
        pattern=r"^[A-Za-z0-9 .'-]{1,50}$",
        example="EMP-205",
    )
    department: str = Field(
        ...,
        pattern=r"^[A-Za-z0-9 .'-]{1,50}$",
        example="Administration",
    )
    role: str = Field(
        ...,
        pattern=r"^[A-Za-z][A-Za-z0-9 .'-]{0,49}$",
        example="Teacher",
    )
    joining_date: date = Field(..., example="2024-01-15")



# Teacherdetails = EmployeeDetails + TeacherAcademic 
class TeacherDetails(EmployeeDetails, BaseModel) :
    class_name: str = Field(
        ...,
        pattern=r"^[A-Za-z0-9 .'-]{1,255}$",
        example="8",
    )
    division: str = Field(
        ...,
        pattern=r"^[A-Za-z0-9 .'-]{1,255}$",
        example="B",
    )
    subjects: str = Field(
        ...,
        pattern=r"^[A-Za-z ,.-]{2,255}$",
        example="English, History",
    )
    batch: str = Field(
        ...,
        pattern=r"^[A-Za-z0-9 .'-]{1,255}$",
        example="Morning",
    )
