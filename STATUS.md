---

# Reservation & Room Status Workflow

This document outlines the business logic for managing reservation and room statuses within the system.

---

## **1. Reservation Creation**

* When a new reservation is created:

  * **Reservation Status** = `reservation` (default).

---

## **2. First Payment Success**

* When the first payment for a reservation is successfully completed:

  * **Reservation Status** = `booking`.

---

## **3. Room Check-In**

* A reservation may include **multiple rooms**.
* If **all associated rooms** are marked as `checked_in`:

  * **Reservation Status** = `checked_in`.
  * Perform respective actions to update room statuses:

    * `db.roomReservations.roomStatus` = `checked_in`.

---

## **4. Room Check-Out**

* A reservation may include **multiple rooms**.
* If **all associated rooms** are marked as `checked_out`:

  * **Reservation Status** = `checked_out`.
  * Perform respective actions to update room statuses:

    * `db.roomReservations.roomStatus` = `checked_out`.

---

## **5. Reservation Cancellation**

* When a reservation is cancelled:

  * **Reservation Status** = `cancelled`.
  * Perform respective actions to update room statuses:

    * `db.roomReservations.roomStatus` = `cancelled`.

---
