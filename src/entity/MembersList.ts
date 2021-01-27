import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    ManyToOne,
    JoinColumn
} from "typeorm";
import { Length } from "class-validator";
import { Member } from "./Member";
import { User } from "./User";
import { DutyEvent } from "./DutyEvent";

@Entity()
export class MembersList {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Length(0, 100)
    name: string;

    @Column()
    userId: string;

    @ManyToOne(() => User, user => user.membersLists)
    @JoinColumn({name: "userId"})
    user: User;

    @OneToMany(() => Member, member => member.membersList)
    members: Member[];

    @OneToMany(() => DutyEvent, dutyEvent => dutyEvent.membersList)
    dutyEvents: DutyEvent[];
}
