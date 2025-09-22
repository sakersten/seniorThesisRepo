# Senior Thesis Repo: [PLACE YOUR PROJECT NAME HERE]
This repository is provided to help you build your senior thesis project. You will edit it to store your specification documents, code, and weekly checkins.

First, fork this repo (this makes a copy of it associated with your account) and then clone it to your machine (this makes a copy of your fork on your personal machine). You can then use an editor and a GitHub client to manage the repository.

### Markdown
This file is called README.md. It is a [Markdown file](https://en.wikipedia.org/wiki/Markdown). Markdown is a simple way to format documents. When a Markdown-ready viewer displays the contents of a file, it formats it to look like HTML. However, Markdown is significantly easier to write than HTML. VSCode supports displaying Markdown in a preview window. GitHub uses Markdown extensively including in every repo's description file, ```README.md```.

All Markdown files end with the extension ```.md```. There is a Markdown tutorial [here](https://www.markdowntutorial.com/) and a Markdown cheatsheet [here](https://www.markdownguide.org/cheat-sheet/).

#### Images
If you would like to add images to a Markdown file, place them in the ```docs/images/``` directory in this repo and reference them using markdown like this:

```
![alt text](relative/path/to/image)
```

Here is how to add the Carthage logo to a Markdown file (you can see the image in the repo right now):

```
![Carthage Firebird Logo](docs/images/firebirdLogo.jpg)
```
![Carthage Firebird Logo](docs/images/firebirdLogo.jpg)

This ensures that images are correctly linked and displayed when viewing the documentation on GitHub or any Markdown-supported platform.

## Code
The ```code``` directory is used to store your code. You can put it all in one directory or you can create subdirectories.

I have added a ```main.cpp``` file to get you started. Feel free to remove it.

If you have any questions feel free to ask me! I'll answer professor questions, customer questions, and give advice if asked.

# Sample Spec

Below is an example of a project specification.  

## Software Requirements Specification for the Mahoney University Registration System

## Introduction

### Purpose
The purpose of this document is to outline the functional and non-functional requirements of Mahoney University’s new online registration system. The system is designed to streamline the registration process for students and faculty, replacing the outdated manual system. This specification serves as a contract between the system stakeholders and the developers to ensure that the system meets the needs of its users while adhering to university policies and technical constraints.

The key goals of the new system are:
- To improve the efficiency of the course registration process for students.
- To provide staff in the Registrar’s Office with tools to manage course offerings, schedules, and student records.
- To enhance the accuracy and accessibility of student academic information, such as grades and enrollment history.
- To support the university’s transition to digital infrastructure while maintaining compatibility with legacy systems during a transitional period.

### Scope
This system is intended to support the registration process for all students at Mahoney University, including undergraduates, graduate students, and non-degree-seeking students. The system will handle:
- Student authentication and secure access to personal records.
- Course search and registration.
- Enrollment validation, including prerequisite checks and course availability.
- Management of student schedules, including the ability to add, drop, or modify course enrollments.
- Grade viewing and transcript requests.

The scope of the system also includes administrative tools for the Registrar’s Office to:
- Create and modify course offerings for each academic term.
- Manage enrollment caps, waitlists, and course prerequisites.
- Track student progress and generate reports for academic performance.

### Definitions, Acronyms, and Abbreviations
- **Registrar**: The official responsible for maintaining student records, managing course schedules, and overseeing the registration process.
- **Student Information System (SIS)**: A university-wide database that stores student records, course information, and academic data.
- **GPA**: Grade Point Average, a numerical representation of a student's academic performance.
- **Semester**: A division of the academic year, typically consisting of a Fall and Spring term, in which courses are offered and completed.
- **Waitlist**: A system that allows students to reserve a spot in a full course, subject to availability if another student drops the course.
- **Prerequisite**: A course or requirement that must be completed before a student can enroll in a more advanced course.
- **User Role**: A designation for system access levels, such as student, registrar, or faculty member, each with different permissions within the system.
- **Concurrent Enrollment**: The ability for students to be enrolled in multiple courses during the same academic term.

## Overview
The Mahoney University Registration System is a web-based platform designed to automate the course registration process for students and faculty. It serves as the primary interface for students to manage their academic schedules and for university staff to oversee the course offerings and registration workflows.

### System Features:
1. **Secure Login**: Ensures that only authorized users have access to the system, with user authentication based on a username and password.
2. **Closet Items**: Allows users to input items that they have in their closet, enabling them to provide items for a packing list. 
3. **Trip Items**: Allows users to add and edit trips, enabling them to input details about their trip to better generate packing lists. 
4. 


2. **Course Search**: Allows students to browse available courses by department, term, and subject, with filtering options based on course availability, schedule, and prerequisites.
3. **Course Registration**: Students can add or drop courses, view class schedules, and receive notifications of any conflicts or unmet prerequisites.
4. **Grades and Transcripts**: Provides students with access to their grades from current and past semesters, as well as the ability to request official transcripts.
5. **Registrar Management Tools**: The Registrar’s Office can create, modify, and delete course sections, set enrollment limits, and manage waitlists.

The system is designed with scalability in mind, allowing it to handle thousands of students registering simultaneously during peak periods. It will integrate with the university’s existing Student Information System (SIS) and is built using modern web technologies to ensure ease of use, reliability, and performance.

The following sections detail the specific use cases that the system will support, describing how students and staff will interact with the system during typical operations.

## Use Cases

### Use Case 1.1: Secure Login
- **Actors**: User
- **Overview**: User uses password to verify their identity.

**Typical Course of Events**:
1. Page prompts for username and password.
2. User enters their username and password and hits enter/login.
3. System verifies that the username and password are correct.

**Alternative Courses**:
- **Step 3**: User and/or password are not correct.
  1. Displays error.
  2. Go back to step 1.

### Use Case 1.2: Input New Closet Item
- **Actors**: User
- **Overview**: User inputs information about their clothes to store in the application. 

**Typical Course of Events**:
1. Run Use Case 1.1, *Secure Login*.
2. Displays small selection of closet items (blank if no items) and a blurb about newest upcoming trip (blank if no items). 
3. User clicks *Input New Closet Item*. 
4. Display New Closet Item Form. 
5. User is prompted to input the closet item with the following required inputs: item type (top, bottom, outerwear, shoes, etc.), style (short-sleeve, long-sleeve, etc.), color (blue, green, etc.), use (casual, fancy, athletic), and season (winter, spring, summer, fall). 
6. System verifies valid entry (all fields are filled out). 
7. Displays item details and successfully added. 

**Alternative Courses**:
- **Step 6**: Entry invalid (User clicks submit but a required field is left blank). 
  1. Display error. 
  2. Go back to step 5. 

### Use Case 1.3: Input New Trip
- **Actors**: User
- **Overview**: User creates a new trip event. 

**Typical Course of Events**:
1. Run Use Case 1.1, *Secure Login*.
2. Displays small selection of closet items (blank if no items) and a blurb about newest upcoming trip (blank if no items). 
3. User clicks on *Create New Trip*.
4. Display New Trip Event Form. 
5. User is prompted to input details about their trip with the following required inputs: destination(s) (at least one location is required, but can have multiple), duration (in days), bag details (backpack only, carry-on, checked bag), trip activities (sightseeing, hiking, etc.), and if laundry is available (clothes can then be reused). 
6. System verifies valid entry (all fields are filled out). 
7. Display item details and successfully added. 

**Alternative Courses**:
- **Step 6**: Entry invalid (User clicks submit but a required field is left blank). 
  1. Display error. 
  2. Go back to step 5. 

### Use Case 1.4: Open Closet 
- **Actors**: User
- **Overview**: User views details about closet items. 

**Typical Course of Events**:
1. Run Use Case 1.1, *Secure Login*.
2. Displays small selection of closet items (blank if no items) and a blurb about newest upcoming trip (blank if no items). 
3. User selects *Details* on *Closet Items*.
4. Displays details about closet items. 

### Use Case 1.5: Open Trip
- **Actors**: User
- **Overview**: User views all details for one of their trips. 

**Typical Course of Events**:
1. Run Use Case 1.1, *Secure Login*.
2. Displays small selection of closet items (blank if no items) and a blurb about newest upcoming trip (blank if no items). 
3. User selects *Details* on *Trips*.
4. Displays details about trip (destination(s), duration, bag details, and if laundry is available).

### Use Case 1.6: Edit Closet Item
- **Actors**: User
- **Overview**: User edits an existing closet item. 

**Typical Course of Events**:
1. Run Use Case 1.1, *Secure Login*.
2. Displays small selection of closet items (blank if no items) and a blurb about newest upcoming trip (blank if no items). 
3. User selects *Details* on *Closet Items*.
4. User selects *Edit Item*. 
5. Displays *Edit Item* Form. 
6. System verifies valid entry (all fields are filled out). 
7. Display item details and successfully updated. 

**Alternative Courses**:
- **Step 6**: Entry invalid
  1. Display error.
  2. Go back to step 5.

### Use Case 1.7: Edit Trip
- **Actors**: User
- **Overview**: User edits an existing trip. 

**Typical Course of Events**:
1. Run Use Case 1.1, *Secure Login*.
2. Displays small selection of closet items (blank if no items) and a blurb about newest upcoming trip (blank if no items). 
3. User selects *Details* on *Trips*.
4. User selects *Edit Trip*. 
5. Displays *Edit Trip* Form. 
6. System verifies valid entry (all fields are filled out). 
7. Display item details and successfully updated. 

**Alternative Courses**:
- **Step 6**: Entry invalid
  1. Display error.
  2. Go back to step 5.

### Use Case 1.8: Delete Item
- **Actors**: User
- **Overview**: User deletes a closet item. 

**Typical Course of Events**:
1. Run Use Case 1.1, *Secure Login*.
2. Displays small selection of closet items (blank if no items) and a blurb about newest upcoming trip (blank if no items). 
3. User selects *Details* on *Closet Items*.
4. User selects *Delete Item*.
5. Displays that the item was successfully deleted. 

**Alternative Courses**:
- **Step 4**: Delete invalid
  1. Display error.
  2. Go back to step 3. 

### Use Case 1.9: Delete Trip
- **Actors**: User
- **Overview**: User deletes a trip. 

**Typical Course of Events**:
1. Run Use Case 1.1, *Secure Login*.
2. Displays small selection of closet items (blank if no items) and a blurb about newest upcoming trip (blank if no items). 
3. User selects *Details* on *Trips*.
4. User selects *Delete Item*.
5. Displays that the item was successfully deleted. 

**Alternative Courses**:
- **Step 4**: Delete invalid
  1. Display error.
  2. Go back to step 3. 

