package com.mail.assistant.service.user;


import com.mail.assistant.user.dto.UserCreateRequest;
import com.mail.assistant.user.dto.UserEditRequest;
import com.mail.assistant.user.model.User;
import com.mail.assistant.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository repo;


    public List<User> findAll() {
        return repo.findAll();
    }


    public User findById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + id));
    }


    public User create(UserCreateRequest req) {
        if (repo.existsByNameIgnoreCase(req.getName())) {
            throw new IllegalArgumentException("Ya existe un usuario con ese nombre");
        }
        User u = User.builder()
                .name(req.getName().trim())
                .info(req.getInfo())
                .build();
        return repo.save(u);
    }


    public User update(Long id, UserEditRequest req) {
        User u = findById(id);
        if (req.getName() != null) {
            String newName = req.getName().trim();
            if (!newName.equalsIgnoreCase(u.getName()) && repo.existsByNameIgnoreCase(newName)) {
                throw new IllegalArgumentException("Ya existe un usuario con ese nombre");
            }
            u.setName(newName);
        }
        if (req.getInfo() != null) {
            u.setInfo(req.getInfo());
        }
        return repo.save(u);
    }


    public void delete(Long id) {
        repo.delete(findById(id));
    }
}