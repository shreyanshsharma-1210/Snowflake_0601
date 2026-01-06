---
trigger: always_on
---

context:
  project: HealthSaarthi Ambulance Driver Interface
  simplicity: ultra_minimal
  driver_actions: ["receive_request","accept_request"]
  excludes: navigation,trip_status,history,verification,payments

ui_screens[2]{id,name,sections}:
  1,Login,
    ["PhoneInput","OTP(optional)"]
  2,IncomingRequestPopup,
    ["PickupInfo","AcceptButton"]

modules[2]:
  Auth,IncomingRequest

driver_flow:
  1.user_books_ambulance
  2.backend_sends_fcm_to_driver
  3.driver_sees_popup
  4.driver_taps_accept
  5.backend_assigns_booking

apis_supabase[2]{endpoint,method,purpose}:
  /driver/login,POST,login_or_create_driver
  /driver/accept-request,POST,assign_driver

sample_payloads[2]{name,payload}:
  fcm_new_request,
    {request_id:"rq500",pickup_text:"ABC Market"}
  accept_request,
    {"driver_id":"d101","request_id":"rq500"}

supabase_tables[2]{table,fields}:
  drivers,
    {id,name,phone,fcm_token}
  ride_requests,
    {id,user_id,pickup_text,status,assigned_driver}

supabase_realtime:
  channel: ride_request_channel
  events: NEW_REQUEST

tech_stack:
  frontend: react
  backend: supabase
  notifications: fcm

edge_cases[2]:
  driver_no_response → assign_next_driver
  request_already_taken → show_message("Assigned to another driver")
