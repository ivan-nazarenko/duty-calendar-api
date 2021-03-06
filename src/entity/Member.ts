import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from "typeorm";
import { Length } from "class-validator";
import { MembersList } from "./MembersList";

@Entity()
export class Member {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Length(0, 100)
    firstName: string;

    @Column()
    @Length(0, 100)
    lastName: string;

    @Column({ default: null, nullable: true })
    email: string;

    @Column({ default: false })
    isNonResident: boolean;

    @Column({ default: false })
    isPrivileged: boolean;

    @ManyToOne(() => MembersList, membersLists => membersLists.members)
    @JoinColumn()
    membersList: MembersList;
}
