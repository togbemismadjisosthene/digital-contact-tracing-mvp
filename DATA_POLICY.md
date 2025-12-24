# Data Policy - Digital Contact Tracing Web App

## Overview
This application implements a **privacy-first, form-based contact tracing system** designed for closed communities (e.g., university campuses, workplaces). The system uses explicit, user-reported interaction data to enable rapid identification of potential exposure chains without relying on location tracking technologies.

## Privacy-First Design Principles

### What We Collect
- **User Identifiers**: Usernames (pseudonymous) for authentication and interaction logging
- **Interaction Data**: 
  - Who (user IDs of interacting parties)
  - When (date and time of interaction)
  - Duration (length of interaction in minutes)
  - Optional notes (text-based, user-provided)
- **Case Reports**: Administrator-reported confirmed cases with timestamps

### What We Do NOT Collect
- ❌ **No GPS/Location Data**: The application strictly avoids any location tracking
- ❌ **No Bluetooth/Proximity Data**: No automated proximity detection is used
- ❌ **No Personal Identifiable Information (PII)**: Only pseudonymous usernames are stored
- ❌ **No Real-Time Location Tracking**: All data is self-reported via forms

## Technical Implementation

### Data Storage
- **Database**: PostgreSQL with proper indexing for efficient querying
- **Authentication**: JWT (JSON Web Tokens) with secure token-based sessions
- **Password Security**: Passwords are hashed using bcrypt (never stored in plain text)
- **Role-Based Access Control**: Strict separation between Member and Administrator roles

### Data Structure
- **Users Table**: Stores user credentials (hashed passwords), roles, and account metadata
- **Interactions Table**: Records user-reported interactions with timestamps and duration
- **Cases Table**: Tracks administrator-reported confirmed cases with audit trail

### Security Measures
- All API endpoints require authentication via JWT tokens
- Administrator-only endpoints are protected by role-based middleware
- Database queries use parameterized statements to prevent SQL injection
- Passwords are hashed server-side using bcrypt (10 rounds)
- Tokens expire after 7 days (configurable)

## Data Retention Policy

### Recommended Retention Periods
- **Interaction Logs**: Retain for **30 days** (configurable), then archive or delete
- **Case Reports**: Retain for **90 days** for audit purposes
- **User Accounts**: Retain while account is active; archive on deletion

### Data Deletion
- Users can request account deletion (administrator action required)
- Interaction logs older than retention period should be automatically purged
- Case reports should be archived (not deleted) for compliance

## Access Control

### Community Members
- Can log their own interactions with other known users
- Can view their own interaction history
- **Cannot** access administrator dashboard or case reporting
- **Cannot** view other users' interactions (except those involving themselves)

### Administrators
- Full access to interaction logs (for tracing purposes)
- Can report confirmed cases
- Can run trace queries to identify primary contacts
- Can simulate notifications to primary contacts
- All administrator actions are logged for auditability

## Audit and Compliance

### Administrator Activity Logging
- All case reports include `reported_by` field (administrator ID)
- All case reports include `reported_at` timestamp
- Database maintains creation timestamps for all records

### Data Access Logs
- Consider implementing API request logging for production use
- Monitor for unauthorized access attempts
- Regular security audits recommended

## Limitations and Assumptions

### Self-Reporting Accuracy
- Data accuracy depends entirely on users voluntarily and accurately logging interactions
- The system cannot verify the accuracy of self-reported data
- Users may forget to log interactions or provide incorrect information

### Scope Limitations
- **Primary Contacts Only**: The MVP traces only direct contacts (not secondary contacts)
- **No Real-Time Notifications**: Notifications are simulated/manual (no SMS/Email integration)
- **No Location Data**: Optional location fields (e.g., "Library", "Cafeteria") are not included in MVP

## Compliance and Legal Considerations

### Before Production Deployment
1. **Legal Review**: Consult with legal and privacy teams
2. **Regulatory Compliance**: Ensure compliance with applicable data protection laws (GDPR, CCPA, etc.)
3. **Privacy Impact Assessment**: Conduct a formal privacy impact assessment
4. **User Consent**: Implement clear user consent mechanisms
5. **Data Processing Agreements**: Establish agreements with any third-party data processors

### Recommended Practices
- Implement HTTPS for all communications
- Use environment variables for sensitive configuration (JWT secrets, database credentials)
- Regular security updates and dependency management
- Implement rate limiting on API endpoints
- Use prepared statements for all database queries
- Regular backups of database with secure storage

## Contact and Support

For questions about data handling, privacy concerns, or to request data deletion, contact your organization's designated privacy officer or IT administrator.

---

**Last Updated**: 2024  
**Version**: MVP (Minimum Viable Product)  
**Status**: Demo/Development - Not for production use without proper security review
