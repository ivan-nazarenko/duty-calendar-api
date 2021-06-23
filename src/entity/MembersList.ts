import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    OneToOne,
    JoinColumn,
    CreateDateColumn
} from "typeorm";
import { Length } from "class-validator";
import { Member } from "./Member";
import { User } from "./User";

@Entity()
export class MembersList {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Length(0, 100)
    name: string;

    @Column()
    userId: string;

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @OneToOne(() => User)
    @JoinColumn({ name: "userId" })
    user: User;

    @OneToMany(() => Member, member => member.membersList, {
        cascade: ["insert", "update", "remove"]
    })
    members: Member[];
}
