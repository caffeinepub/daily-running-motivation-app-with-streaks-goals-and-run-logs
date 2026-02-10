import Time "mo:core/Time";
import Array "mo:core/Array";
import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Nat64 "mo:core/Nat64";
import Nat "mo:core/Nat";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    displayName : ?Text;
  };

  public type DistanceUnit = {
    #meters;
    #kilometers;
    #miles;
  };

  public type Goal = {
    targetDistance : ?Float;
    targetTimeMinutes : Float; // in minutes
    unit : DistanceUnit;
    createdAt : Int; // timestamp in nanoseconds
  };

  public type RunLog = {
    id : Text;
    user : Principal;
    distance : ?Float; // in selected unit
    timeMinutes : Float;
    unit : DistanceUnit;
    notes : ?Text;
    timestamp : Int; // time of run in nanoseconds
    createdAt : Int; // time log created in nanoseconds
  };

  public type Motivation = {
    message : Text;
    createdAt : Int; // timestamp in nanoseconds
  };

  public type Achievement = {
    id : Nat;
    name : Text;
    description : Text;
    unlockedDate : Int; // timestamp in nanoseconds
  };

  type MotivationState = {
    messages : List.List<(Text, Text)>;
    achievements : List.List<(Text, Text)>;
    achievementHistory : Map.Map<Principal, List.List<Achievement>>;
    dailyGoals : Map.Map<Principal, List.List<Goal>>;
    runLogs : Map.Map<Principal, List.List<RunLog>>;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextAchievementId = 0;

  let motivationState : MotivationState = {
    messages = List.fromArray<(Text, Text)>([
      ("Keep pushing!", "Every step is progress."),
      ("Stay consistent!", "Small daily wins add up."),
      ("You are strong!", "Your dedication inspires others."),
    ]);
    achievements = List.fromArray<(Text, Text)>([
      ("First Run", "Completed your first run"),
      ("3 Day Streak", "Ran 3 days in a row"),
      ("7 Day Streak", "Ran 7 days in a row"),
      ("Marathon", "Completed a marathon distance"),
    ]);
    achievementHistory = Map.empty<Principal, List.List<Achievement>>();
    dailyGoals = Map.empty<Principal, List.List<Goal>>();
    runLogs = Map.empty<Principal, List.List<RunLog>>();
  };

  module Goal {
    public func compare(goal1 : Goal, goal2 : Goal) : Order.Order {
      switch (Nat64.compare(Nat64.fromIntWrap(goal1.createdAt), Nat64.fromIntWrap(goal2.createdAt))) {
        case (#equal) { Text.compare(goal1.targetTimeMinutes.toText(), goal2.targetTimeMinutes.toText()) };
	      case (order) { order };
      };
    };
  };

  module RunLog {
    public func compare(run1 : RunLog, run2 : RunLog) : Order.Order {
      switch (Nat64.compare(Nat64.fromIntWrap(run1.createdAt), Nat64.fromIntWrap(run2.createdAt))) {
        case (#equal) { Text.compare(run1.id, run2.id) };
	      case (order) { order };
      };
    };
  };

  module Achievement {
    public func compare(achievement1 : Achievement, achievement2 : Achievement) : Order.Order {
      switch (Nat64.compare(Nat64.fromIntWrap(achievement1.unlockedDate), Nat64.fromIntWrap(achievement2.unlockedDate))) {
        case (#equal) { Nat.compare(achievement1.id, achievement2.id) };
        case (order) { order };
      };
    };
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Goal Management
  public shared ({ caller }) func saveDailyGoal(goal : Goal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update goals");
    };
    let goals = getOrCreateGoals(caller);
    goals.add(goal);
    motivationState.dailyGoals.add(caller, goals);
  };

  public query ({ caller }) func getGoals() : async [Goal] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access goals");
    };
    switch (motivationState.dailyGoals.get(caller)) {
      case (?goals) { goals.toArray().sort() };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func deleteGoal(goalIdx : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update goals");
    };
    switch (motivationState.dailyGoals.get(caller)) {
      case (?goals) {
        let goalsArray = goals.toArray();
        if (goalIdx >= goalsArray.size()) {
          Runtime.trap("Invalid goal index");
        };
        let newGoals = goalsArray.sliceToArray(0, goalIdx).concat(goalsArray.sliceToArray(goalIdx + 1, goalsArray.size()));
        motivationState.dailyGoals.add(caller, List.fromArray<Goal>(newGoals));
      };
      case (null) {
        Runtime.trap("No goals found to delete");
      };
    };
  };

  // Run Log Management
  public shared ({ caller }) func addRunLog(log : RunLog) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add run logs");
    };

    // Verify ownership: the log must belong to the caller
    if (log.user != caller) {
      Runtime.trap("Unauthorized: Cannot create run logs for other users");
    };

    // Validate time
    if (log.timeMinutes <= 0) {
      Runtime.trap("Invalid time: Run duration must be positive");
    };

    // Validate distance if provided
    switch (log.distance) {
      case (?dist) {
        if (dist < 0) {
          Runtime.trap("Invalid distance: Distance cannot be negative");
        };
      };
      case (null) {};
    };

    let logs = getOrCreateRunLogs(caller);
    logs.add(log);
    motivationState.runLogs.add(caller, logs);
  };

  public query ({ caller }) func getRunLogs(limit : ?Nat) : async [RunLog] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access run logs");
    };
    switch (motivationState.runLogs.get(caller)) {
      case (?logs) {
        let logArray = logs.toArray().sort();
        switch (limit) {
          case (?l) { logArray.sliceToArray(0, Nat.min(l, logArray.size())) };
          case (null) { logArray };
        };
      };
      case (null) { [] };
    };
  };

  // Achievement Management
  public shared ({ caller }) func completeGoal(_goalId : Text) : async {
    achievements : [Achievement];
  } {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can complete goals");
    };

    let achievement = {
      id = nextAchievementId;
      name = "First Run";
      description = "Completed your first run";
      unlockedDate = Time.now();
    };

    nextAchievementId += 1;

    let userHistory = getOrCreateAchievements(caller);
    userHistory.add(achievement);

    motivationState.achievementHistory.add(caller, userHistory);

    { achievements = userHistory.toArray() };
  };

  public query ({ caller }) func getAchievements(_timeRangeInDays : ?Nat) : async [Achievement] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access achievements");
    };
    switch (motivationState.achievementHistory.get(caller)) {
      case (?achievements) { achievements.toArray().sort() };
      case (null) { [] };
    };
  };

  // Motivation - Available to all including guests
  public query ({ caller }) func getMotivationMessage() : async Text {
    // Allow guests to view motivation messages to encourage sign-up
    let messages = motivationState.messages;
    if (messages.isEmpty()) {
      "Keep running!";
    } else {
      let firstMessage = messages.values().next();
      switch (firstMessage) {
        case (?(msg, _)) { msg };
        case (null) { "Keep running!" };
      };
    };
  };

  // Helper functions
  func getOrCreateGoals(user : Principal) : List.List<Goal> {
    switch (motivationState.dailyGoals.get(user)) {
      case (?goals) { goals };
      case (null) {
        let newGoals = List.empty<Goal>();
        motivationState.dailyGoals.add(user, newGoals);
        newGoals;
      };
    };
  };

  func getOrCreateAchievements(user : Principal) : List.List<Achievement> {
    switch (motivationState.achievementHistory.get(user)) {
      case (?history) { history };
      case (null) {
        let newHistory = List.empty<Achievement>();
        motivationState.achievementHistory.add(user, newHistory);
        newHistory;
      };
    };
  };

  func getOrCreateRunLogs(user : Principal) : List.List<RunLog> {
    switch (motivationState.runLogs.get(user)) {
      case (?logs) { logs };
      case (null) {
        let newLogs = List.empty<RunLog>();
        motivationState.runLogs.add(user, newLogs);
        newLogs;
      };
    };
  };
};
