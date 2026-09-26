from sqlalchemy import Select, or_
from models import *


def apply_comman_filters(
    stmt: Select,
    model,
    *,
    id: int | None = None,
    gender: str | None = None,
    status: str | None = None,
    search: str | None = None,
):
    if id is not None:
        stmt = stmt.where(model.id == id)
    if gender:
        stmt = stmt.where(model.gender == gender)
    if status:
        stmt = stmt.where(model.status == status)
    if search:
        value = f"%{search}%"
        stmt = stmt.where(
            or_(
                model.firstName.ilike(value),
                model.middleName.ilike(value),
                model.lastName.ilike(value),
                model.phone.ilike(value),
                model.zip.ilike(value),
                model.state.ilike(value),
                model.country.ilike(value),
                model.address.ilike(value),
                model.email.ilike(value),
            )
        )
    return stmt


def apply_student_filters(
    stmt: Select,
    studentmodel,
    academicmodel,
    *,
    id: int | None = None,
    gender: str | None = None,
    batch: str | None = None,
    class_name: str | None = None,
    subjects: str | None = None,
    status: str | None = None,
    division: str | None = None,
    search: str | None = None,
):
    stmt = apply_comman_filters(
        stmt, studentmodel, id=id, gender=gender, status=status, search=search,
    )

    if batch:
        stmt = stmt.where(studentmodel.academics.has(academicmodel.batch ==batch))
    if class_name:
        stmt = stmt.where(studentmodel.academics.has(academicmodel.class_name==class_name))
    if subjects:
        stmt = stmt.where(
            studentmodel.academics.has(academicmodel.subjects.contains(subjects))
        )
    if division:
        stmt = stmt.where(studentmodel.academics.has(academicmodel.division == division))

    return stmt


def apply_employee_filters(
    stmt,
    model1,
    *,
    id: int | None = None,
    empID: str | None = None,
    gender: str | None = None,
    status: str | None = None,
    search: str | None = None,
    department: str | None = None,
    role: str | None = None,
):
    stmt = apply_comman_filters(
        stmt, model1, id=id, gender=gender, search=search, status=status
    )
    if empID:
        stmt = stmt.where(model1.empId == empID)
    if department:
        stmt = stmt.where(model1.department == department)
    if role:
        stmt = stmt.where(model1.role == role)
    return stmt


def apply_teacher_filter(
    stmt,
    model1,
    model2,
    *,
    batch: str | None = None,
    class_name: str | None = None,
    subjects: str | None = None,
    division: str | None = None,
):
    if batch:
        stmt = stmt.where(model1.academics.has(model2.batch.contains(batch)))
    if class_name:
        stmt = stmt.where(model1.academics.has(model2.class_name.contains(class_name)))
    if subjects:
        stmt = stmt.where(model1.academics.has(model2.subjects.contains(subjects)))
    if division:
        stmt = stmt.where(model1.academics.has(model2.division.contains(division)))

    return stmt



'''from sqlalchemy import or_

subjects = "Math,Science"
tokens = [s.strip() for s in subjects.split(",") if s.strip()]

predicates = [
    academicmodel.subjects.ilike(f"%{token}%")
    for token in tokens
]

stmt = stmt.where(studentmodel.academics.has(or_(*predicates)))'''
