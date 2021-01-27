import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    ManyToMany,
    JoinTable,
    JoinColumn
} from "typeorm";
import { MembersList } from "./MembersList";
import { User } from "./User";

@Entity()
export class DutyEvent {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    date: Date;

    @Column()
    status: Boolean;

    @Column()
    listId: number;

    @ManyToOne(() => MembersList, membersList => membersList.dutyEvents)
    @JoinColumn({name: "listID"})
    membersList: MembersList;

    @ManyToMany(() => User)
    @JoinTable()
    users: User[];
}
