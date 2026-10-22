package com.example.webapp.controller;

import com.example.webapp.dto.WalletRequest;
import com.example.webapp.dto.WalletResponse;
import com.example.webapp.model.User;
import com.example.webapp.model.Wallet;
import com.example.webapp.model.WalletTransaction;
import com.example.webapp.model.WalletTransactionType;
import com.example.webapp.repository.WalletRepository;
import com.example.webapp.repository.WalletTransactionRepository;
import com.example.webapp.util.CurrentUserProvider;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = "http://localhost:5173")
public class WalletController {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final CurrentUserProvider currentUserProvider;

    public WalletController(WalletRepository walletRepository,
                             WalletTransactionRepository walletTransactionRepository,
                             CurrentUserProvider currentUserProvider) {
        this.walletRepository = walletRepository;
        this.walletTransactionRepository = walletTransactionRepository;
        this.currentUserProvider = currentUserProvider;
    }

    private Wallet getOrCreateWallet(User user) {
        return walletRepository.findByUser(user).orElseGet(() -> {
            Wallet wallet = new Wallet();
            wallet.setUser(user);
            wallet.setBalance(BigDecimal.ZERO);
            return walletRepository.save(wallet);
        });
    }

    @GetMapping
    public WalletResponse getWallet(Authentication authentication) {
        User user = currentUserProvider.resolve(authentication);
        Wallet wallet = getOrCreateWallet(user);
        List<WalletTransaction> recent = walletTransactionRepository
                .findByWalletOrderByCreatedAtDesc(wallet)
                .stream().limit(10).toList();
        return new WalletResponse(wallet.getBalance(), recent);
    }

    @PostMapping("/topup")
    public ResponseEntity<WalletResponse> topup(@Valid @RequestBody WalletRequest request,
                                                 Authentication authentication) {
        User user = currentUserProvider.resolve(authentication);
        Wallet wallet = getOrCreateWallet(user);

        wallet.setBalance(wallet.getBalance().add(request.getAmount()));
        walletRepository.save(wallet);

        WalletTransaction tx = new WalletTransaction();
        tx.setWallet(wallet);
        tx.setType(WalletTransactionType.CREDIT);
        tx.setAmount(request.getAmount());
        tx.setNote(request.getNote() != null ? request.getNote() : "Wallet top-up");
        walletTransactionRepository.save(tx);

        List<WalletTransaction> recent = walletTransactionRepository
                .findByWalletOrderByCreatedAtDesc(wallet).stream().limit(10).toList();

        return ResponseEntity.ok(new WalletResponse(wallet.getBalance(), recent));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<?> withdraw(@Valid @RequestBody WalletRequest request,
                                       Authentication authentication) {
        User user = currentUserProvider.resolve(authentication);
        Wallet wallet = getOrCreateWallet(user);

        if (wallet.getBalance().compareTo(request.getAmount()) < 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Insufficient wallet balance.");
        }

        wallet.setBalance(wallet.getBalance().subtract(request.getAmount()));
        walletRepository.save(wallet);

        WalletTransaction tx = new WalletTransaction();
        tx.setWallet(wallet);
        tx.setType(WalletTransactionType.DEBIT);
        tx.setAmount(request.getAmount());
        tx.setNote(request.getNote() != null ? request.getNote() : "Wallet withdrawal");
        walletTransactionRepository.save(tx);

        List<WalletTransaction> recent = walletTransactionRepository
                .findByWalletOrderByCreatedAtDesc(wallet).stream().limit(10).toList();

        return ResponseEntity.ok(new WalletResponse(wallet.getBalance(), recent));
    }
}