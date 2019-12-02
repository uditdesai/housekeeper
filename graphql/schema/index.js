const { buildSchema } = require("graphql");

module.exports = buildSchema(`
type Task {
    _id: ID!
    title: String!
    description: String!
    date: String!
    endDate: String
    creator: User!
    house: House!
    assignee: User
    progress: String!
}
type User {
    _id: ID!
    name: String!
    email: String!
    password: String
    house: House!
    housePassword: String
    createdTasks: [Task!]
    assignedTasks: [Task!]
}
type House {
    _id: ID!
    name: String!
    password: String
    users: [User!]
    tasks: [Task!]
}
type AuthData {
    userId: ID!
    token: String!
    tokenExpiration: Int!
    name: String!
    house: House!
}
input TaskInput {
    title: String!
    description: String!
    date: String!
    endDate: String
}
input UserInput {
    name: String!
    email: String!
    password: String!
    house: String!
    housePassword: String!
}
type RootQuery {
    tasks: [Task!]!
    login(email: String!, password: String!): AuthData!
}
type RootMutation {
    createTask(taskInput: TaskInput): Task
    createUser(userInput: UserInput): User
    assignTask(taskId: ID!): Task
    unassignTask(taskId: ID!): Task
    deleteTask(taskId: ID!): Task
    completeTask(taskId: ID!): Task
}
schema {
    query: RootQuery
    mutation: RootMutation
}
`);
