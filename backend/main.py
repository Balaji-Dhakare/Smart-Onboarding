from fastapi import FastAPI, Depends, HTTPException, Query,status
from fastapi.encoders import jsonable_encoder
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from database import engine, Base, SessionLocal
from schema import *
from models import User, Academics
from fastapi.middleware.cors import CORSMiddleware
from filters.CommanFilters import *

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/", status_code=status.HTTP_200_OK)
def greet():
    return {
        "message": "Welcome to the Smart Onboarding API!",
    }


@app.get("/students/")
def fetch_students(
    id: int | None = None,
    gender: str | None = None,
    batch: str | None = None,
    class_name: str | None = None,
    subjects: str | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    division: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
):

    stmt = select(User).options(joinedload(User.academics))

    stmt = apply_student_filters(
        stmt,
        User,
        Academics,
        id=id,
        gender=gender,
        batch=batch,
        class_name=class_name,
        subjects=subjects,
        status=status_filter,
        division=division,
        search=search,
    )

    data = db.scalars(stmt).all()

    if not data:
        return {"data": [], "status": status.HTTP_200_OK}

    return {
        "data": jsonable_encoder(data),
        "status": status.HTTP_200_OK,
    }


@app.get("/employees/")
def fetch_employees(
    id: int | None = None,
    empID: str | None = None,
    gender: str | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    search: str | None = None,
    department: str | None = None,
    role: str | None = None,
    db: Session = Depends(get_db),
):

    stmt = select(Employee)

    stmt = apply_employee_filters(
        stmt,
        Employee,
        id=id,
        empID=empID,
        gender=gender,
        status=status_filter,
        search=search,
        department=department,
        role=role,
    )

    data = db.scalars(stmt).all()
    if not data:
        return {"data": [], "status": status.HTTP_200_OK}

    return {"data": jsonable_encoder(data), "status": status.HTTP_200_OK}


@app.get("/employees/teachers/")
def fetch_teachers(
    id: int | None = None,
    empID: str | None = None,
    gender: str | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    search: str | None = None,
    batch: str | None = None,
    class_name: str | None = None,
    subjects: str | None = None,
    division: str | None = None,
    db: Session = Depends(get_db),
):

    stmt = (
        select(Employee)
        .options(joinedload(Employee.academics))
        .where(Employee.role == "Teacher")
    )

    stmt = apply_employee_filters(
        stmt,
        Employee,
        id=id,
        empID=empID,
        gender=gender,
        status=status_filter,
        search=search,
    )

    stmt = apply_teacher_filter(
        stmt,
        Employee,
        TeacherAcademics,
        batch=batch,
        class_name=class_name,
        subjects=subjects,
        division=division,
    )

    data = db.scalars(stmt).all()
    if not data:
        return {"data": [], "status": status.HTTP_200_OK}

    return {"data": jsonable_encoder(data), "status": status.HTTP_200_OK}


@app.post("/students/")
def create_user(new_student: StudentDetails, db: Session = Depends(get_db)):
    try:
        new_user = User(
            firstName=new_student.firstName,
            middleName=new_student.middleName,
            lastName=new_student.lastName,
            email=new_student.email,
            address=new_student.address,
            phone=new_student.phone,
            guardianPhone=new_student.guardianPhone,
            gender=new_student.gender,
            dob=new_student.dob,
            country=new_student.country,
            state=new_student.state,
            zip=new_student.zip,
            status=new_student.status,
        )

        db.add(new_user)

        db.flush()
        new_academics = Academics(
            user_id=new_user.id,
            class_name=new_student.class_name,
            division=new_student.division,
            subjects=new_student.subjects,
            batch=new_student.batch,
        )

        db.add(new_academics)
        db.commit()
        db.refresh(new_user)
        db.refresh(new_academics)

        return {
            "message": "Student admission submitted successfully",
            "user_id": new_user.id,
            "academic_id": new_academics.id,
            "status":status.HTTP_201_CREATED
        }
    except Exception as error:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(error))

@app.post("/employees/")
def add_employee(new_employee: EmployeeDetails, db: Session = Depends(get_db)):
    try:
        new_emp = Employee(
            firstName=new_employee.firstName,
            middleName=new_employee.middleName,
            lastName=new_employee.lastName,
            email=new_employee.email,
            address=new_employee.address,
            phone=new_employee.phone,
            gender=new_employee.gender,
            dob=new_employee.dob,
            country=new_employee.country,
            state=new_employee.state,
            zip=new_employee.zip,
            status=new_employee.status,
            empId=new_employee.empId,
            role=new_employee.role,
            department=new_employee.department,
            joining_date=new_employee.joining_date,
        )

        db.add(new_emp)
        db.commit()
        db.refresh(new_emp)

        return {
            "message": "Employee registered successfully",
            "status": status.HTTP_201_CREATED,
            "employee_id": new_emp.id,
        }
    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(error),
        )

    
@app.post("/employees/teachers")
def add_employee(new_employee: TeacherDetails, db: Session = Depends(get_db)):
    try:
        new_emp = Employee(
            firstName=new_employee.firstName,
            middleName=new_employee.middleName,
            lastName=new_employee.lastName,
            email=new_employee.email,
            address=new_employee.address,
            phone=new_employee.phone,
            gender=new_employee.gender,
            dob=new_employee.dob,
            country=new_employee.country,
            state=new_employee.state,
            zip=new_employee.zip,
            status=new_employee.status,
            empId=new_employee.empId,
            role=new_employee.role,
            department=new_employee.department,
            joining_date=new_employee.joining_date,
        )

        db.add(new_emp)
        db.flush()
        new_academics = TeacherAcademics(
            employee_id=new_emp.id,
            class_name=new_employee.class_name,
            division=new_employee.division,
            subjects=new_employee.subjects,
            batch=new_employee.batch,
        )
        db.add(new_academics)
        db.flush()
        db.commit()
        db.refresh(new_emp)
        db.refresh(new_academics)

        return {
            "message": "Employee registered successfully",
            "status": status.HTTP_201_CREATED,
            "employee_id": new_emp.id,
            "academics_id": new_academics.id,
        }
    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(error),
        )